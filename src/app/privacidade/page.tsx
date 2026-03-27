'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaDePrivacidade() {
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
        <span className="font-serif text-lg font-bold tracking-tight ml-3">Política de Privacidade</span>
      </nav>

      {/* ── Content ── */}
      <main className="pt-28 pb-20 px-6">
        <article className="max-w-3xl mx-auto">

          <header className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-[var(--on-surface-variant)] md3-body-medium">
              Última atualização: março de 2026
            </p>
          </header>

          <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--primary-container)]/30 border border-[var(--primary)]/20 mb-10">
            <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
              A <strong>Neksti</strong> valoriza a privacidade dos seus usuários. Esta Política de Privacidade descreve como
              coletamos, utilizamos, armazenamos e protegemos seus dados pessoais ao utilizar a plataforma{' '}
              <strong>Neksti Studio AI</strong>, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei n.º 13.709/2018
              — LGPD) e demais normas aplicáveis.
            </p>
          </div>

          <div className="space-y-10">

            {/* 1 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">1. Dados Pessoais Coletados</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Ao utilizar o Neksti Studio AI, podemos coletar os seguintes dados pessoais:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li><strong>Dados de identificação:</strong> endereço de e-mail utilizado para autenticação via código de verificação (OTP);</li>
                  <li><strong>Dados de uso:</strong> histórico de gerações de imagem, prompts utilizados, preferências de cenário e configurações;</li>
                  <li><strong>Imagens enviadas:</strong> fotografias de produtos enviadas pelo usuário para processamento pela IA;</li>
                  <li><strong>Imagens geradas:</strong> fotografias resultantes do processamento por inteligência artificial;</li>
                  <li><strong>Dados de pagamento:</strong> informações transacionais processadas pela Stripe (a Neksti não armazena dados completos de cartão de crédito);</li>
                  <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, dados de sessão e logs de acesso.</li>
                </ul>
              </div>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">2. Base Legal para o Tratamento</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD (Art. 7º):
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li><strong>Execução de contrato (Art. 7º, V):</strong> para a prestação do serviço contratado, incluindo autenticação, geração de imagens e processamento de pagamentos;</li>
                  <li><strong>Consentimento (Art. 7º, I):</strong> para o envio de comunicações de marketing, newsletters e uso de imagens para aprimoramento dos modelos de IA;</li>
                  <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para análises internas de uso, melhoria da Plataforma, prevenção a fraudes e segurança do serviço;</li>
                  <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> para manutenção de registros de acesso conforme o Marco Civil da Internet (Lei n.º 12.965/2014).</li>
                </ul>
              </div>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">3. Finalidade do Tratamento</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Seus dados pessoais são tratados para as seguintes finalidades:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li>Criação e gerenciamento da sua conta de usuário;</li>
                  <li>Autenticação e verificação de identidade via e-mail (OTP);</li>
                  <li>Processamento e geração de imagens por meio de inteligência artificial;</li>
                  <li>Processamento de pagamentos e gerenciamento de assinaturas;</li>
                  <li>Armazenamento e disponibilização das imagens geradas;</li>
                  <li>Comunicação sobre atualizações, novidades e suporte ao cliente;</li>
                  <li>Melhoria contínua da Plataforma e dos modelos de IA;</li>
                  <li>Cumprimento de obrigações legais e regulatórias;</li>
                  <li>Prevenção a fraudes e segurança da informação.</li>
                </ul>
              </div>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">4. Compartilhamento com Terceiros</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Para viabilizar a prestação do serviço, seus dados podem ser compartilhados com os seguintes terceiros, que atuam como
                  operadores de dados:
                </p>
                <div className="space-y-3 mt-3">
                  <div className="p-4 rounded-[var(--shape-large)] bg-[var(--surface-container-high)]/60 border border-[var(--outline-variant)]/15">
                    <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                      <strong>Supabase</strong> — Plataforma de autenticação e armazenamento de dados e imagens. Seus dados de conta,
                      imagens enviadas e imagens geradas são armazenados nos servidores da Supabase.
                    </p>
                  </div>
                  <div className="p-4 rounded-[var(--shape-large)] bg-[var(--surface-container-high)]/60 border border-[var(--outline-variant)]/15">
                    <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                      <strong>Google Cloud / Vertex AI</strong> — Serviço de inteligência artificial utilizado para o processamento e
                      geração de imagens. As imagens enviadas são temporariamente processadas nos servidores do Google Cloud.
                    </p>
                  </div>
                  <div className="p-4 rounded-[var(--shape-large)] bg-[var(--surface-container-high)]/60 border border-[var(--outline-variant)]/15">
                    <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                      <strong>Stripe</strong> — Plataforma de processamento de pagamentos. Dados de transação e informações de cobrança
                      são processados pela Stripe em conformidade com os padrões PCI-DSS.
                    </p>
                  </div>
                </div>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Neksti não comercializa, aluga ou cede seus dados pessoais a terceiros para finalidades diversas das descritas
                  nesta Política. O compartilhamento ocorre estritamente para a execução do serviço contratado.
                </p>
              </div>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">5. Armazenamento e Segurança</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Neksti adota medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não
                  autorizado, destruição, perda, alteração ou qualquer forma de tratamento inadequado, incluindo:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li>Criptografia de dados em trânsito (TLS/HTTPS) e em repouso;</li>
                  <li>Autenticação segura via código de verificação por e-mail (OTP);</li>
                  <li>Controle de acesso restrito aos dados pessoais;</li>
                  <li>Monitoramento e registro de acessos (logs);</li>
                  <li>Infraestrutura em nuvem com provedores que mantêm certificações de segurança reconhecidas internacionalmente.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Os dados poderão ser armazenados em servidores localizados fora do Brasil (em razão dos provedores de
                  infraestrutura utilizados), sempre observando as salvaguardas previstas na LGPD para transferência internacional
                  de dados (Art. 33).
                </p>
              </div>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">6. Direitos do Titular dos Dados</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Em conformidade com os artigos 17 a 22 da LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li><strong>Confirmação e acesso:</strong> obter confirmação sobre a existência de tratamento e acessar seus dados pessoais;</li>
                  <li><strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li><strong>Anonimização, bloqueio ou eliminação:</strong> solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
                  <li><strong>Portabilidade:</strong> solicitar a portabilidade dos seus dados a outro fornecedor de serviço;</li>
                  <li><strong>Eliminação:</strong> solicitar a eliminação dos dados pessoais tratados com base no consentimento;</li>
                  <li><strong>Informação sobre compartilhamento:</strong> obter informações sobre as entidades públicas e privadas com as quais seus dados foram compartilhados;</li>
                  <li><strong>Revogação do consentimento:</strong> revogar o consentimento a qualquer momento, sem prejuízo da licitude do tratamento realizado anteriormente;</li>
                  <li><strong>Oposição:</strong> opor-se ao tratamento de dados quando realizado com base em hipótese legal diversa do consentimento, em caso de descumprimento da LGPD.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Para exercer qualquer um desses direitos, entre em contato com nosso encarregado pelo tratamento de dados pessoais
                  (DPO) por meio do e-mail indicado na seção 10 desta Política. Responderemos sua solicitação no prazo de 15 (quinze)
                  dias, conforme previsto na LGPD.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">7. Retenção de Dados</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Seus dados pessoais serão mantidos apenas pelo período necessário para cumprir as finalidades descritas nesta
                  Política, observando os seguintes critérios:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li><strong>Dados de conta:</strong> mantidos enquanto a conta estiver ativa. Após solicitação de exclusão, os dados serão eliminados em até 30 dias, salvo obrigação legal de retenção;</li>
                  <li><strong>Imagens enviadas e geradas:</strong> mantidas enquanto a conta estiver ativa. Após exclusão da conta, as imagens serão removidas em até 30 dias;</li>
                  <li><strong>Dados de pagamento:</strong> mantidos conforme exigências fiscais e contábeis aplicáveis (até 5 anos após a transação);</li>
                  <li><strong>Registros de acesso:</strong> mantidos por 6 meses, conforme o Marco Civil da Internet (Art. 15, Lei n.º 12.965/2014).</li>
                </ul>
              </div>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">8. Cookies e Tecnologias Semelhantes</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Plataforma pode utilizar cookies e tecnologias semelhantes para:
                </p>
                <ul className="list-disc list-inside text-[var(--on-surface-variant)] md3-body-medium leading-relaxed space-y-2 ml-2">
                  <li><strong>Cookies essenciais:</strong> necessários para o funcionamento da Plataforma, incluindo autenticação e manutenção de sessão;</li>
                  <li><strong>Cookies de desempenho:</strong> utilizados para coletar informações sobre como a Plataforma é utilizada, visando melhorias contínuas;</li>
                  <li><strong>Cookies de funcionalidade:</strong> permitem lembrar suas preferências e personalizar sua experiência.</li>
                </ul>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Você pode gerenciar as configurações de cookies diretamente no seu navegador. A desativação de cookies essenciais
                  poderá impactar o funcionamento adequado da Plataforma.
                </p>
              </div>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">9. Alterações nesta Política</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  A Neksti poderá atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas
                  ou em exigências legais. Sempre que houver alterações relevantes, notificaremos você por meio da Plataforma ou
                  por e-mail. A data da última atualização será sempre indicada no topo deste documento. Recomendamos a consulta
                  periódica desta página.
                </p>
              </div>
            </section>

            {/* 10 */}
            <section>
              <h2 className="font-serif text-xl font-bold mb-3">10. Contato do Encarregado (DPO)</h2>
              <div className="p-6 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 space-y-4">
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Para questões relacionadas à privacidade e proteção de dados pessoais, incluindo o exercício de seus direitos
                  como titular, entre em contato com nosso encarregado pelo tratamento de dados pessoais (DPO):
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  <strong>Neksti — Encarregado de Proteção de Dados</strong><br />
                  E-mail:{' '}
                  <a href="mailto:contato@neksti.com.br" className="text-[var(--primary)] hover:underline">contato@neksti.com.br</a><br />
                  Website:{' '}
                  <a href="https://studio.neksti.com.br" className="text-[var(--primary)] hover:underline">studio.neksti.com.br</a>
                </p>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">
                  Caso entenda que o tratamento dos seus dados pessoais viola a legislação vigente, você também tem o direito de
                  apresentar reclamação perante a Autoridade Nacional de Proteção de Dados (ANPD).
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
