# Documentação Técnica — Neksti Studio

Guia completo para desenvolvedores que vão trabalhar no projeto.

---

## Visão Geral

Neksti Studio é um SaaS que usa IA generativa (Google Gemini via Vertex AI) para transformar fotos de produtos tiradas com celular em composições profissionais de estúdio. O produto atende lojistas de joias, moda e calçados.

**Proposta de valor**: O lojista envia a foto do produto, escolhe cenário/cor/props/modelo e a IA gera uma imagem de qualidade profissional. 1 crédito = 1 geração.

---

## Arquitetura Geral

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────>│   Next.js App    │────>│   Vertex AI     │
│   (React)    │<────│   (API Routes)   │<────│   (Gemini)      │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │    │
                    ┌──────┘    └──────┐
                    v                  v
             ┌────────────┐    ┌────────────┐
             │  Supabase   │    │   Stripe   │
             │ (DB + Auth  │    │ (Pagamento)│
             │  + Storage) │    │            │
             └────────────┘    └────────────┘
                    │
                    v
             ┌────────────┐
             │   Resend    │
             │  (E-mails)  │
             └────────────┘
```

---

## Componentes Principais

### 1. `POST /api/generate` — Geração de Imagem

Este é o endpoint mais crítico da aplicação. Recebe FormData com imagens + seleções do usuário e retorna uma imagem gerada pela IA.

**Pipeline completo:**

1. **Autenticação** — Valida JWT do header `Authorization: Bearer <token>`
2. **Rate limit** — Máx 10 gerações/min por userId (Map in-memory, limpo a cada minuto)
3. **Dedução de crédito** — Chama RPC `decrement_credit(userId)` (atômico, previne race condition)
4. **Parse FormData** — Extrai `files[]`, `selections` (JSON), `niche`
5. **Validação** — Máx 5 arquivos, tipos permitidos: JPEG, PNG, WebP, HEIC
6. **Upload original** — Primeiro arquivo redimensionado para WebP 75%, upload para Supabase Storage (fire-and-forget, não bloqueia geração)
7. **Otimização para IA** — Todos os arquivos redimensionados para 768x768px, JPEG 60% (reduz payload base64 em ~50%)
8. **Build prompt** — `buildEnglishPrompt(niche, selections)` gera prompt em inglês de ~300-500 palavras
9. **Auth Vertex AI** — JWT assinado com service account do Google
10. **Model Cascade** — Tenta Flash (2x) depois Pro (1x) com time budget de 100s
11. **Extração** — Pega base64 da imagem gerada do response do Vertex
12. **Persistência** — Insere na tabela `generations` com URLs original + gerada
13. **Response** — `{ imageUrl: "data:image/jpeg;base64,...", newCredits: N, usedModel: "Flash" }`

**Se falha após deduzir crédito:**
- Chama RPC `refund_credit(userId)` para devolver o crédito
- Retorna `{ error: "...", refunded: true }` com status 502

**Classificação de erros:**

| Tipo | Retry? | Ação |
|------|--------|------|
| 429 (rate limit) | Sim | Backoff exponencial |
| 500/502/503 | Sim | Backoff exponencial |
| Timeout/rede | Sim | Backoff exponencial |
| 400 (bad request) | Não | Erro permanente |
| 401/403 (auth) | Não | Erro permanente |
| SAFETY | Não | Retorna 422 + refund |

### 2. `src/app/studio/page.tsx` — Página Principal

Componente de ~1200 linhas que gerencia todo o fluxo do estúdio:

- **State management**: useState para todas as seleções, imagens, loading states
- **Sidebar**: componente `<Sidebar>` com wizard de 6 etapas
- **Preview**: componente `<ImagePreviewCard>` com upload, loading e resultado
- **Batch mode**: componente `<BatchPanel>` para upload de até 5 imagens
- **Auto-retry client**: até 2 tentativas silenciosas com `recoverFromTimeout()` antes de cada retry

**Fluxo de geração (client-side):**
```
1. Processa imagens uma vez (processImageForAI)
2. Loop de retry (max 2 tentativas):
   a. Se retry: verifica recoverFromTimeout() primeiro
   b. Reconstrói FormData (stream é consumida pelo fetch)
   c. POST /api/generate
   d. Se 401/403/429: erro permanente (throw)
   e. Se !ok: retry se tentativas restantes, senão throw
   f. Se ok: setImageUrl, atualiza galeria, refreshCredits
```

### 3. `src/lib/prompt-builder.ts` — Engenharia de Prompt

Mapeia seleções do usuário (em português) para descrições técnicas em inglês. Usa dicionários por nicho:

- `produto`: categoria → descrição detalhada em inglês
- `fundo`: cor → descrição de iluminação/estúdio
- `props`: prop → descrição física/material
- `exibicao`: tipo de display → descrição de cenário
- `tipografia`: fonte → estilo tipográfico
- `modelo`: modelo humano → descrição de pose/aparência

O prompt final inclui termos de fotografia profissional (soft-box, rim lighting, ray-tracing, bokeh, depth of field) para guiar o Gemini.

### 4. `src/lib/niche-config.ts` — Configuração de Nichos

Define todas as opções disponíveis para cada nicho (joalheria, moda, calçados):

- Categorias de produto (com ícones)
- Paleta de 20 cores
- Props/adornos
- Tipos de exibição
- Modelos humanos (com imagens de preview)
- Fontes tipográficas
- Posição/cor/tamanho de texto
- Formatos de imagem (1:1, 4:5, 9:16, 1.91:1)

### 5. `src/contexts/AuthContext.tsx` — Autenticação

Provider global que gerencia:

- Estado do usuário (`user`, `session`, `loading`)
- Refresh de sessão a cada 10 min
- Refresh ao voltar à aba (visibilitychange)
- `signOut()` com redirect para `/auth`

### 6. `middleware.ts` — Proteção de Rotas

- Intercepta todas as requests para `/studio/*`
- Verifica sessão Supabase
- Se não autenticado: redirect para `/auth?next=/studio/...`
- Refresh automático de tokens

---

## Sistema de Créditos

**Operações atômicas via PostgreSQL RPC:**

- `decrement_credit(userId)` — Deduz 1 crédito SE credits > 0. Retorna novo saldo ou -1 se não tinha crédito.
- `refund_credit(userId)` — Devolve 1 crédito. Chamado quando geração falha.

**Por que RPC e não UPDATE direto?**
Race condition: dois requests simultâneos poderiam ler `credits = 1`, ambos deduzir, resultando em `credits = -1`. O RPC usa `WHERE credits > 0` que é atômico no PostgreSQL.

**Fluxo de crédito em caso de falha:**
```
1. Deduz crédito (antes de chamar IA)
2. Tenta gerar imagem
3. Se falha → chama refund_credit
4. Client recebe { refunded: true }
5. Toast: "Crédito devolvido, tente novamente"
```

---

## Stripe Integration

### Checkout

Cada plano tem uma URL fixa do Stripe Checkout. O `PricingModal` abre essa URL com query params:

```
https://buy.stripe.com/xxx?prefilled_email=user@email.com&client_reference_id=userId
```

### Webhook (`POST /api/webhooks/stripe`)

```
1. Verifica assinatura (stripe.webhooks.constructEvent)
2. Extrai amount_total (em centavos BRL)
3. Mapeia:
   - 40000 → 100 créditos (Essentials R$400)
   - 60000 → 240 créditos (Professional R$600)
   - 100000 → 500 créditos (Premium R$1.000)
4. Encontra usuário por client_reference_id ou email
5. Adiciona créditos ao perfil
6. Envia email de confirmação
```

---

## Design System (Material Design 3)

O projeto usa tokens CSS custom seguindo a spec Material Design 3:

### Paleta
- **Surface**: Navy dark (`#0A1320` → `#233752`)
- **Primary**: Neksti Green (`#6DBF8A`)
- **Secondary**: Navy Light (`#8FA8C4`)
- **Error**: Red/orange

### Classes utilitárias
```css
/* Botões */
.m3-btn-filled      /* Botão preenchido (primary) */
.m3-btn-tonal       /* Botão tonal (secondary) */
.m3-btn-outlined    /* Botão com borda */
.m3-btn-text        /* Botão texto */
.m3-btn-elevated    /* Botão elevado */

/* Tipografia */
.md3-display-large   /* 57px */
.md3-headline-medium /* 28px */
.md3-title-large     /* 22px */
.md3-body-large      /* 16px */
.md3-label-large     /* 14px, semibold */

/* Elevação */
.elevation-1         /* Sombra nível 1 */
.elevation-2         /* Sombra nível 2 */
.elevation-3         /* Sombra nível 3 */

/* Shape */
var(--shape-small)        /* 8px */
var(--shape-medium)       /* 12px */
var(--shape-large)        /* 16px */
var(--shape-extra-large)  /* 28px */
var(--shape-full)         /* 9999px */
```

---

## Otimizações de Performance

1. **Sharp server-side** — Imagens otimizadas no servidor (não no browser)
2. **768px para IA** — Threshold ideal do Gemini, reduz payload em 50%
3. **ISR no showcase** — Revalida a cada 60s, cache no edge
4. **Upload paralelo** — Original sobe para Storage em paralelo com chamada IA
5. **Session refresh** — Token atualizado a cada 10min (evita expiry durante uso)
6. **Fire-and-forget** — Upload original, error logging, email — não bloqueiam response

---

## Error Handling

### Frontend
- `ErrorBoundary` — Captura crashes de componentes React
- `GlobalErrorCatcher` — Captura erros de rede, promises rejeitadas
- `reportError()` — Envia para `/api/errors` (fire-and-forget)
- Toasts amigáveis — Nunca `alert()`, sempre toast com mensagem humana

### Backend
- Rate limit: 429
- Sem créditos: 403
- Arquivo inválido: 400
- Auth expirada: 401
- IA instável: 502 + refund
- Safety block: 422 + refund
- Erro genérico: 500

---

## Migrations Pendentes (Supabase SQL Editor)

Arquivos SQL na raiz do projeto que precisam ser rodados manualmente:

1. `supabase-migration-refund-credit.sql` — RPC de reembolso de crédito
2. `supabase-migration-cost-tracking.sql` — Tracking de custos (se existir)
3. `supabase-migration-showcase.sql` — Coluna showcase na tabela generations (se existir)

---

## Troubleshooting

### 502 Bad Gateway
- PM2 não está rodando: `pm2 status` → se vazio, `pm2 start npm --name "studio" -- start`
- Build falhou: `npm run build` e verificar erros
- Porta ocupada: `lsof -i :3000`

### Geração falha repetidamente
- Verificar logs: `pm2 logs --lines 50`
- Verificar Vertex AI: erros 429 = rate limit do Google, esperar
- Verificar service account: chave pode ter expirado

### Créditos não somam após pagamento
- Verificar webhook Stripe: Dashboard Stripe → Webhooks → logs
- Verificar `STRIPE_WEBHOOK_SECRET` está correto no .env
- Verificar mapeamento de valores no webhook route

### E-mails não chegam
- Verificar `RESEND_API_KEY` no .env
- Verificar domínio verificado no Resend
- Para auth emails: configurar SMTP custom no Supabase Dashboard
