# Neksti Studio

**Plataforma SaaS de geração de imagens profissionais com IA para e-commerce.**

Transforma fotos de celular em composições de estúdio fotográfico usando Google Vertex AI (Gemini). Focado em joalherias, moda e calçados.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 + Material Design 3 tokens |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (OTP e-mail) |
| IA | Google Vertex AI (Gemini Flash + Pro) |
| Pagamento | Stripe (assinaturas) |
| E-mail | Resend (transacionais) |
| Imagem | Sharp (otimização server-side) |
| Storage | Supabase Storage (WebP) |
| Deploy | Ubuntu + Nginx + PM2 |

---

## Como rodar localmente

```bash
# 1. Clonar
git clone https://github.com/giovani-neksti/studio.git
cd studio

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher todas as variáveis (ver seção "Variáveis de Ambiente")

# 4. Rodar migrations no Supabase SQL Editor
# (ver seção "Banco de Dados")

# 5. Iniciar dev server
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Vertex AI (Service Account)
GOOGLE_PROJECT_ID=seu-project-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Admin
ADMIN_BYPASS_PASSWORD=senha_admin_aqui

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# E-mail (Resend)
RESEND_API_KEY=re_...
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Layout raiz (fonts, analytics, theme)
│   ├── auth/
│   │   ├── page.tsx                # Login (OTP + admin bypass)
│   │   └── callback/route.ts       # OAuth/OTP callback
│   ├── studio/
│   │   ├── page.tsx                # App principal (geração de imagens)
│   │   └── geracoes/page.tsx       # Galeria do usuário
│   ├── admin/page.tsx              # Dashboard admin
│   ├── termos/page.tsx             # Termos de uso
│   ├── privacidade/page.tsx        # Política de privacidade
│   └── api/
│       ├── generate/route.ts       # Geração de imagens (endpoint core)
│       ├── credits/route.ts        # Consulta/criação de créditos
│       ├── generations/route.ts    # Histórico paginado
│       ├── showcase/route.ts       # Carrossel antes/depois (ISR)
│       ├── errors/route.ts         # Log de erros do client
│       ├── admin-login/route.ts    # Login admin com senha
│       ├── admin/
│       │   ├── stats/route.ts      # Métricas do admin
│       │   ├── showcase/route.ts   # Toggle showcase
│       │   └── financeiro/route.ts # Dados financeiros
│       └── webhooks/
│           └── stripe/route.ts     # Webhook Stripe
├── components/
│   ├── Sidebar.tsx                 # Wizard de composição (6 etapas)
│   ├── ImagePreviewCard.tsx        # Preview + upload + resultado
│   ├── PricingModal.tsx            # Modal de planos
│   ├── BatchPanel.tsx              # Upload em lote (até 5)
│   ├── GalleryModal.tsx            # Galeria lightbox
│   ├── NeuralBackground.tsx        # Background animado SVG
│   ├── ShowcaseCarousel.tsx        # Carrossel antes/depois
│   ├── ShareToast.tsx              # Toast de compartilhamento
│   ├── ErrorBoundary.tsx           # Error boundary React
│   ├── GlobalErrorCatcher.tsx      # Captura erros globais
│   └── ui/                         # Componentes base (shadcn/ui)
├── lib/
│   ├── supabase.ts                 # Client server-side (Service Role)
│   ├── supabase-browser.ts         # Client client-side (Anon Key)
│   ├── niche-config.ts             # Configuração dos 3 nichos
│   ├── prompt-builder.ts           # Construção de prompts em inglês
│   ├── resend.ts                   # E-mails transacionais
│   ├── admin.ts                    # Lista de admins
│   ├── reportError.ts              # Report de erros fire-and-forget
│   └── utils.ts                    # cn() utility
├── contexts/
│   └── AuthContext.tsx              # Provider de autenticação global
├── hooks/
│   ├── useTheme.ts                 # Toggle dark/light
│   └── useShareImage.ts            # Web Share API
└── middleware.ts                    # Proteção de rotas /studio/*
```

---

## Banco de Dados

### Tabelas

**`public.profiles`**

| Coluna | Tipo | Default |
|--------|------|---------|
| id | UUID (FK auth.users) | — |
| email | text | — |
| credits | integer | 3 |
| total_generations | integer | 0 |
| created_at | timestamp | now() |
| updated_at | timestamp | now() |

**`public.generations`**

| Coluna | Tipo | Default |
|--------|------|---------|
| id | UUID | gen_random_uuid() |
| user_id | UUID (FK auth.users) | — |
| niche | text | — |
| original_image_url | text | null |
| generated_image_url | text | null |
| showcase | boolean | false |
| created_at | timestamp | now() |

**`public.error_logs`**

| Coluna | Tipo |
|--------|------|
| id | UUID |
| message | text (max 2000) |
| stack | text (max 5000) |
| source | text ('client' / 'server') |
| url | text |
| user_id | UUID (nullable) |
| user_agent | text |
| metadata | jsonb |
| created_at | timestamp |

### RPCs (Functions)

```sql
-- Deduz 1 crédito atomicamente (retorna novo saldo)
CREATE OR REPLACE FUNCTION public.decrement_credit(user_id UUID)
RETURNS INTEGER AS $$
DECLARE new_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1, updated_at = now()
  WHERE id = user_id AND credits > 0
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, -1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reembolsa 1 crédito (chamado quando geração falha)
CREATE OR REPLACE FUNCTION public.refund_credit(user_id UUID)
RETURNS INTEGER AS $$
DECLARE new_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits + 1, updated_at = now()
  WHERE id = user_id
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS (Row Level Security)

- `profiles`: usuário só lê/atualiza o próprio perfil
- `generations`: usuário só lê as próprias gerações
- `error_logs`: sem RLS (escrita livre para capturar erros)

---

## Arquitetura

### Fluxo de Geração de Imagem

```
Cliente                    API /generate                 Vertex AI
  │                            │                            │
  ├─ Upload foto + seleções ──>│                            │
  │                            ├─ Autentica JWT             │
  │                            ├─ Rate limit (10/min)       │
  │                            ├─ Deduz crédito (RPC)       │
  │                            ├─ Otimiza imagem (768px)    │
  │                            ├─ Constrói prompt inglês    │
  │                            │                            │
  │                            ├─ Flash (tentativa 1) ─────>│
  │                            │   timeout: 45s             │
  │                            │<── falha (retryable) ──────│
  │                            │                            │
  │                            ├─ Flash (tentativa 2) ─────>│
  │                            │   timeout: 30s             │
  │                            │<── falha ──────────────────│
  │                            │                            │
  │                            ├─ Pro (tentativa 1) ───────>│
  │                            │   timeout: restante        │
  │                            │<── sucesso + imagem ───────│
  │                            │                            │
  │                            ├─ Salva no Supabase         │
  │<── { imageUrl, credits } ──│                            │
  │                            │                            │
  │  Se falha total:           │                            │
  │<── { error, refunded } ────├─ Reembolsa crédito (RPC)  │
```

### Model Cascade

| Modelo | Tentativas | Timeout 1a | Timeout retry | Uso |
|--------|-----------|-----------|--------------|-----|
| gemini-2.0-flash-exp | 2 | 45s | 30s | Rápido, 90% dos casos |
| gemini-3-pro-image-preview | 1 | restante | — | Fallback, maior qualidade |

- **Time Budget**: 100s max (rota tem `maxDuration: 120s`). Se passou de 100s, para o cascade.
- **Client-side auto-retry**: até 2 tentativas silenciosas. Verifica se imagem já foi gerada antes de retentar (evita cobrança dupla).
- **Erros retryable**: 429, 500, 502, 503, timeout, rede.
- **Erros permanentes**: 400, 401, 403, 404, SAFETY (param imediatamente).

### Fluxo de Autenticação

```
1. Usuário entra email em /auth
2. Se admin → mostra campo de senha → POST /api/admin-login
3. Se normal → Supabase envia OTP (8 dígitos) por e-mail
4. Usuário digita OTP → Supabase verifica
5. Callback /auth/callback → cria sessão
6. Se perfil novo (< 60s) → envia welcome email
7. Redirect → /studio
```

- **Middleware** (`middleware.ts`): protege `/studio/*`, redireciona para `/auth` se não autenticado.
- **Sessão**: refresh a cada 10 min + ao voltar à aba.

### Fluxo de Pagamento (Stripe)

```
1. Usuário clica "Assinar" no PricingModal
2. Abre Stripe Checkout (URL pré-configurada com email + userId)
3. Stripe processa pagamento
4. Webhook POST /api/webhooks/stripe (checkout.session.completed)
5. Mapeia valor → créditos:
   - R$ 400  → 100 créditos (Essentials)
   - R$ 600  → 240 créditos (Professional)
   - R$ 1.000 → 500 créditos (Premium)
6. Adiciona créditos no perfil
7. Envia e-mail de confirmação
```

---

## API Routes

### Geração

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/generate` | Gera imagem com IA (core) |
| GET | `/api/generations?page=1` | Histórico paginado (24/página) |

### Créditos e Pagamento

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/credits?userId=xxx` | Consulta/cria perfil com créditos |
| POST | `/api/webhooks/stripe` | Webhook Stripe (checkout.session.completed) |

### Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/admin-login` | Login admin com senha |
| GET | `/api/admin/stats` | Métricas do dashboard |
| PATCH | `/api/admin/showcase` | Toggle showcase (max 20) |
| GET | `/api/admin/financeiro` | Dados financeiros |

### Público

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/showcase` | Carrossel antes/depois (ISR 60s) |
| POST | `/api/errors` | Log de erros do client |

---

## Nichos e Composição

### Joalheria
- **Categorias**: anel, colar, brinco, pulseira, relógio, pingente, aliança, conjunto, broche
- **Exibição**: busto, caixa, pedestal, levitação, superfície reflexiva, display giratório, ninho de veludo, pedra natural, gelo
- **Props**: gotas d'água, pétala de orquídea, folha dourada, cristais, pó de ouro
- **Cores**: 20 opções (preto, branco, borgonha, azul royal, etc.)

### Moda
- **Categorias**: camiseta, vestido, calça, jaqueta, saia, blazer, camisa, top, shorts
- **Exibição**: cabide, flat-lay, dobrado, manequim, mesa, cena lifestyle
- **Modelos humanos**: 9 variações

### Calçados
- **Categorias**: tênis, sandália, bota, sapato social, chinelo, sapatilha, mocassim
- **Exibição**: flutuante, ângulo dinâmico, na caixa, par alinhado, lifestyle
- **Modelos humanos**: 2 variações

Cada nicho tem sua própria paleta de 20 cores, dicionário de prompts em inglês, e configuração de props/exibição.

---

## E-mails Transacionais

Enviados via **Resend** (`src/lib/resend.ts`).

| Evento | Assunto | Quando |
|--------|---------|--------|
| Cadastro | Bem-vindo ao Neksti Studio! | Primeiro login |
| Créditos zerados | Seus créditos acabaram | credits == 0 após geração |
| Compra | Compra confirmada | Webhook Stripe |

Remetente: `Neksti Studio <studio@neksti.com.br>`

---

## Prompt Engineering

Os prompts são construídos em **inglês** (melhor performance do Gemini) via `src/lib/prompt-builder.ts`.

Cada seleção do usuário (cor, prop, exibição, modelo, tipografia) é mapeada para uma descrição detalhada em inglês com termos de fotografia profissional (soft-box, rim lighting, ray-tracing, bokeh, etc.).

Prompt final: ~300-500 palavras, altamente específico para o nicho e as seleções do usuário.

---

## Admin Dashboard

Acesso: `/admin` (apenas e-mails na whitelist com senha).

**Métricas:**
- Usuários totais / novos hoje / novos no mês
- Gerações totais / hoje
- Créditos distribuídos
- Usuários ativos / sem créditos
- Erros hoje / totais
- Lista de usuários com créditos e gerações
- Gerações recentes com toggle de showcase
- Logs de erro

---

## Deploy (Ubuntu + Nginx + PM2)

### Setup inicial

```bash
# 1. Clonar e instalar
git clone https://github.com/giovani-neksti/studio.git ~/studio
cd ~/studio
npm install

# 2. Configurar .env.local
nano .env.local
# Preencher todas as variáveis

# 3. Build
npm run build

# 4. Iniciar com PM2
pm2 start npm --name "studio" -- start
pm2 save
pm2 startup  # auto-start no boot
```

### Nginx config

```nginx
server {
    listen 80;
    server_name studio.neksti.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
```

### Deploy de atualizações

```bash
cd ~/studio && git pull && npm run build && pm2 restart all
```

### Comandos úteis

```bash
pm2 status          # Ver processos
pm2 logs            # Ver logs em tempo real
pm2 logs --lines 50 # Últimas 50 linhas
pm2 restart all     # Reiniciar
pm2 stop all        # Parar
```

---

## Segurança

- **Auth**: Supabase Auth com OTP (e-mail). Admin bypass apenas para e-mails na whitelist.
- **RLS**: Row Level Security em todas as tabelas de dados do usuário.
- **Rate Limit**: 10 gerações/min por usuário (in-memory).
- **Validação**: tipos de arquivo (JPEG, PNG, WebP, HEIC), máx 5 arquivos por request.
- **Secrets**: todas as chaves em `.env.local`, nunca commitadas.
- **Webhook**: assinatura Stripe verificada em cada request.
- **Middleware**: rotas `/studio/*` protegidas, redirect para `/auth`.

---

## Testes

```bash
npm run test           # Rodar testes
npm run test:watch     # Watch mode
npm run test:coverage  # Com cobertura
```

Framework: **Vitest**

---

## Scripts

```bash
npm run dev        # Dev server (hot reload)
npm run build      # Build produção
npm run start      # Server produção
npm run lint       # ESLint
npm run test       # Testes
```
