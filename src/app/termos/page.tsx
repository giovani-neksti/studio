'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermosDeUso() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/20">

      {/* ── Top Bar ── */}
      <nav className="h-16 flex items-center px-4 md:px-6 fixed top-0 w-full z-50 bg-[var(--surface-container-low)]/80 backdrop-blur-lg border-b border-[var(--outline-variant)]/20">
        <button
          onClick={() => router.push('/')}
          className="h-10 w-10 rounded-[var(--shape-full)] flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors duration-[var(--duration-short4)]"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-serif text-lg font-bold tracking-tight ml-3">Termos de Uso</span>
      </nav>

      {/* ── Content ── */}
      <main className="pt-28 pb-20 px-6">
        <article className="max-w-3xl mx-auto">

          <header className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-[var(--on-surface-variant)] md3-body-medium">
              Última atualização: março de 2026
            </p>
          </header>

          <div className="space-y-10">

            {/* 1 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">1. Aceitação dos Termos</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Ao acessar ou utilizar a plataforma <strong>Neksti Studio AI</strong> ("Plataforma"), disponível em{' '}
                  <a href="https://studio.neksti.com.br" className="text-[var(--primary)] hover:underline">studio.neksti.com.br</a>,
                  você declara que leu, compreendeu e concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer
                  disposição aqui prevista, solicitamos que não utilize nossos serviços.
                </p>
              </div>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">2. Descrição do Serviço</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  O Neksti Studio AI é uma plataforma de geração de fotografias profissionais de produtos por meio de inteligência
                  artificial. O serviço permite que o usuário envie fotos de produtos tiradas com dispositivos comuns (como celulares)
                  e, por meio de tecnologia de IA generativa (Google Vertex AI), gere imagens compostas com cenários, iluminação e
                  fundos de qualidade profissional.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Plataforma é voltada especialmente para empreendedores e empresas dos segmentos de joalheria, moda e calçados,
                  embora possa ser utilizada por qualquer segmento que necessite de fotografias de produto de alta qualidade.
                </p>
              </div>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">3. Cadastro e Conta</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Para utilizar o Neksti Studio AI, é necessário criar uma conta por meio de autenticação via e-mail com código
                  de verificação (OTP). Ao se cadastrar, você se compromete a:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li>Fornecer informações verdadeiras e atualizadas;</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso;</li>
                  <li>Notificar imediatamente a Neksti sobre qualquer uso não autorizado de sua conta;</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Neksti reserva-se o direito de suspender ou encerrar contas que violem estes Termos ou que apresentem
                  atividade suspeita.
                </p>
              </div>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">4. Créditos e Pagamentos</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  O uso da Plataforma é baseado em um sistema de créditos. Cada geração de imagem consome uma quantidade
                  determinada de créditos, conforme o plano contratado.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>4.1 Planos e Assinaturas.</strong> A Neksti oferece planos mensais de assinatura com diferentes
                  quantidades de créditos. Os valores e condições de cada plano estão descritos na página de preços da Plataforma
                  e podem ser atualizados mediante aviso prévio.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>4.2 Processamento de Pagamentos.</strong> Todos os pagamentos são processados de forma segura pela{' '}
                  <strong>Stripe</strong>, plataforma de pagamentos internacional. A Neksti não armazena dados completos de
                  cartão de crédito em seus servidores. Ao realizar um pagamento, você concorda com os{' '}
                  <a href="https://stripe.com/br/legal" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
                    termos de serviço da Stripe
                  </a>.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>4.3 Renovação Automática.</strong> As assinaturas mensais são renovadas automaticamente ao final de cada
                  ciclo de cobrança, salvo cancelamento prévio pelo usuário.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>4.4 Política de Reembolso.</strong> Créditos não utilizados não são reembolsáveis. O cancelamento da
                  assinatura interrompe cobranças futuras, mas não gera direito a reembolso proporcional pelo período restante.
                  Em caso de falha técnica comprovada que impeça a utilização dos créditos, a Neksti analisará solicitações de
                  reembolso caso a caso, mediante contato pelo e-mail{' '}
                  <a href="mailto:contato@neksti.com.br" className="text-[var(--primary)] hover:underline">contato@neksti.com.br</a>.
                </p>
              </div>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">5. Uso Aceitável</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Ao utilizar o Neksti Studio AI, você se compromete a não:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li>Gerar imagens com conteúdo ilegal, difamatório, obsceno, violento ou que viole direitos de terceiros;</li>
                  <li>Utilizar a Plataforma para criar material enganoso ou fraudulento, incluindo publicidade enganosa;</li>
                  <li>Enviar imagens que contenham conteúdo protegido por direitos autorais de terceiros sem a devida autorização;</li>
                  <li>Tentar acessar sistemas, dados ou contas de outros usuários sem autorização;</li>
                  <li>Utilizar engenharia reversa, descompilar ou desmontar qualquer parte da Plataforma;</li>
                  <li>Sobrecarregar intencionalmente a infraestrutura da Plataforma ou interferir em seu funcionamento;</li>
                  <li>Revender, sublicenciar ou redistribuir o acesso à Plataforma sem autorização prévia por escrito.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  O descumprimento desta seção poderá resultar na suspensão ou encerramento imediato da conta, sem direito a
                  reembolso, além de eventuais medidas legais cabíveis.
                </p>
              </div>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">6. Propriedade Intelectual</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>6.1 Imagens Geradas.</strong> As imagens geradas pelo usuário por meio da Plataforma pertencem ao
                  próprio usuário, que poderá utilizá-las para fins comerciais e promocionais livremente.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>6.2 Licença de Uso para Melhoria.</strong> Ao utilizar a Plataforma, você concede à Neksti uma licença
                  não exclusiva, mundial, livre de royalties e irrevogável para utilizar as imagens enviadas e geradas com a
                  finalidade exclusiva de melhorar, treinar e aprimorar os modelos e algoritmos da Plataforma. Essa licença não
                  autoriza a Neksti a comercializar ou divulgar publicamente suas imagens sem consentimento adicional.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>6.3 Marca e Software.</strong> A marca "Neksti", o logotipo, a interface e o código-fonte da Plataforma
                  são de propriedade exclusiva da Neksti e estão protegidos pela legislação brasileira de propriedade intelectual.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">7. Limitação de Responsabilidade</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Plataforma é fornecida "como está" (<em>as is</em>). A Neksti envidará seus melhores esforços para manter o
                  serviço disponível e funcional, mas não garante:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li>Disponibilidade ininterrupta ou livre de erros;</li>
                  <li>Que os resultados gerados pela IA atenderão integralmente às expectativas do usuário;</li>
                  <li>A precisão, completude ou adequação dos resultados para qualquer finalidade específica.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Em nenhuma hipótese a Neksti será responsável por danos indiretos, incidentais, consequenciais ou punitivos
                  decorrentes do uso ou da impossibilidade de uso da Plataforma, na máxima extensão permitida pela legislação
                  aplicável.
                </p>
              </div>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">8. Modificações nos Termos</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Neksti reserva-se o direito de alterar estes Termos de Uso a qualquer momento. As alterações serão
                  comunicadas por meio da Plataforma e/ou por e-mail. O uso continuado da Plataforma após a publicação de
                  alterações constitui aceitação dos novos termos.
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Recomendamos a revisão periódica desta página para se manter informado sobre eventuais atualizações.
                </p>
              </div>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">9. Foro e Legislação Aplicável</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a resolução de quaisquer
                  controvérsias decorrentes destes Termos, fica eleito o foro da Comarca de domicílio do usuário, conforme
                  previsto no Código de Defesa do Consumidor (Lei n.º 8.078/1990).
                </p>
              </div>
            </section>

            {/* 10 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">10. Contato</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Em caso de dúvidas, reclamações ou sugestões relacionadas a estes Termos de Uso, entre em contato conosco:
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed mt-3">
                  <strong>Neksti</strong><br />
                  E-mail:{' '}
                  <a href="mailto:contato@neksti.com.br" className="text-[var(--primary)] hover:underline">contato@neksti.com.br</a><br />
                  Website:{' '}
                  <a href="https://studio.neksti.com.br" className="text-[var(--primary)] hover:underline">studio.neksti.com.br</a>
                </p>
              </div>
            </section>

          </div>
        </article>
      </main>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-[var(--outline-variant)]/20 px-6 bg-[var(--surface-container-lowest)]/90">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[var(--outline)] md3-body-small">
            © 2026 Neksti. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
