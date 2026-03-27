import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPurchaseConfirmationEmail } from '@/lib/resend';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// Credits by amount paid (centavos BRL)
function creditsFromAmount(centavos: number): { credits: number; plan: string } {
  if (centavos >= 100000) return { credits: 1000, plan: 'Premium' };
  if (centavos >= 60000) return { credits: 400, plan: 'Professional' };
  if (centavos >= 40000) return { credits: 200, plan: 'Essentials' };
  return { credits: 0, plan: 'Unknown' };
}

async function addCreditsToUser(userId: string | null, email: string | null, creditsToAdd: number) {
  // Try by userId first
  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits + creditsToAdd, updated_at: new Date().toISOString() })
        .eq('id', userId);
      return userId;
    }
  }

  // Fallback: find by email
  if (email) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, credits')
      .eq('email', email)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits + creditsToAdd, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      return profile.id;
    }
  }

  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    if (webhookSecret && !webhookSecret.startsWith('whsec_CONFIGURE') && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
      console.warn('Stripe webhook: signature not verified — configure STRIPE_WEBHOOK_SECRET');
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { credits, plan } = creditsFromAmount(session.amount_total || 0);

    if (credits === 0) {
      console.error('Unknown plan amount:', session.amount_total, 'session:', session.id);
      return NextResponse.json({ received: true, warning: 'Unknown plan' });
    }

    const userId = session.client_reference_id;
    const email = session.customer_details?.email || session.customer_email;

    const resolvedId = await addCreditsToUser(userId, email, credits);

    if (resolvedId) {
      console.log(`Stripe: +${credits} credits (${plan}) -> user ${resolvedId}`);
      // Send purchase confirmation email
      const buyerEmail = email;
      if (buyerEmail) {
        const amountPaid = ((session.amount_total || 0) / 100).toFixed(2).replace('.', ',');
        sendPurchaseConfirmationEmail(buyerEmail, credits, amountPaid).catch(() => {});
      }
    } else {
      console.error(`Stripe: could not find user. userId=${userId}, email=${email}, session=${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
