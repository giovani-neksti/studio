import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      return NextResponse.redirect(`${origin}/studio`);
    }
    return NextResponse.redirect(`${origin}/auth?error=otp`);
  }

  // Fallback — redirect to auth page
  return NextResponse.redirect(`${origin}/auth`);
}
