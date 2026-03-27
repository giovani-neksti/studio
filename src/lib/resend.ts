import { Resend } from 'resend';

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = 'Neksti Studio <noreply@neksti.com.br>';

/** Welcome email — sent on first sign-up */
export async function sendWelcomeEmail(to: string) {
  const r = getResend();
  await r.emails.send({
    from: FROM,
    to,
    subject: 'Bem-vindo ao Neksti Studio!',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Neksti Studio</h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Bem-vindo ao Neksti Studio!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Sua conta foi criada com sucesso. Você já tem <strong>3 créditos grátis</strong> para começar a transformar suas fotos de produto em imagens de estúdio profissional.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Cada crédito gera uma imagem com IA. É simples: envie a foto, escolha o cenário e pronto.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://studio.neksti.com.br/studio" style="display: inline-block; padding: 14px 32px; background: #6750a4; color: #fff; text-decoration: none; border-radius: 100px; font-size: 15px; font-weight: 600;">
            Acessar o Estúdio
          </a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          Neksti Studio — Fotografia profissional com IA<br/>
          <a href="https://studio.neksti.com.br" style="color: #6750a4;">studio.neksti.com.br</a>
        </p>
      </div>
    `,
  });
}

/** Credits exhausted email */
export async function sendCreditsExhaustedEmail(to: string) {
  const r = getResend();
  await r.emails.send({
    from: FROM,
    to,
    subject: 'Seus créditos acabaram — Neksti Studio',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Neksti Studio</h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Seus créditos acabaram</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Você usou todos os seus créditos no Neksti Studio. Para continuar gerando fotos profissionais com IA, adquira mais créditos.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Temos planos a partir de <strong>R$ 29,90</strong> com créditos que não expiram.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://studio.neksti.com.br/studio" style="display: inline-block; padding: 14px 32px; background: #6750a4; color: #fff; text-decoration: none; border-radius: 100px; font-size: 15px; font-weight: 600;">
            Comprar Créditos
          </a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          Neksti Studio — Fotografia profissional com IA<br/>
          <a href="https://studio.neksti.com.br" style="color: #6750a4;">studio.neksti.com.br</a>
        </p>
      </div>
    `,
  });
}

/** Purchase confirmation email */
export async function sendPurchaseConfirmationEmail(
  to: string,
  credits: number,
  amountPaid: string
) {
  const r = getResend();
  await r.emails.send({
    from: FROM,
    to,
    subject: 'Compra confirmada — Neksti Studio',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Neksti Studio</h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Compra confirmada!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Seu pagamento foi processado com sucesso. Aqui está o resumo:
        </p>
        <div style="background: #f5f0ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; font-size: 15px; color: #444;">
            <tr>
              <td style="padding: 6px 0;">Créditos adicionados</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">${credits} créditos</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Valor pago</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">R$ ${amountPaid}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Seus créditos já estão disponíveis. Bom uso!
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://studio.neksti.com.br/studio" style="display: inline-block; padding: 14px 32px; background: #6750a4; color: #fff; text-decoration: none; border-radius: 100px; font-size: 15px; font-weight: 600;">
            Ir para o Estúdio
          </a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          Neksti Studio — Fotografia profissional com IA<br/>
          <a href="https://studio.neksti.com.br" style="color: #6750a4;">studio.neksti.com.br</a>
        </p>
      </div>
    `,
  });
}
