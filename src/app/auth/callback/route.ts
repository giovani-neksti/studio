import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/resend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const origin = new URL(request.url).origin;

  if (code) {
    // OAuth PKCE flow (Google, etc.) — exchange code for session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send welcome email for new users (profile created_at within last 60s)
      const email = data.user?.email;
      if (email) {
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('created_at')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            const age = Date.now() - new Date(profile.created_at).getTime();
            if (age < 60_000) {
              sendWelcomeEmail(email).catch(() => {});
            }
          }
        } catch {}
      }
      return NextResponse.redirect(`${origin}/studio`);
    }
    // If exchange fails, redirect to auth with error hint
    return NextResponse.redirect(`${origin}/auth?error=oauth`);
  }

  if (token_hash && type) {
    // Email OTP / magic link confirmation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: otpData, error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      // Send welcome email for new users
      const email = otpData.user?.email;
      if (email && otpData.user) {
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('created_at')
            .eq('id', otpData.user.id)
            .single();
          if (profile) {
            const age = Date.now() - new Date(profile.created_at).getTime();
            if (age < 60_000) {
              sendWelcomeEmail(email).catch(() => {});
            }
          }
        } catch {}
      }
      return NextResponse.redirect(`${origin}/studio`);
    }
    return NextResponse.redirect(`${origin}/auth?error=otp`);
  }

  // Fallback — redirect to auth page
  return NextResponse.redirect(`${origin}/auth`);
}
