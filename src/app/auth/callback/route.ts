import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const origin = new URL(request.url).origin;

  if (code) {
    // PKCE flow — exchange code for session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(`${origin}/studio`);
  }

  if (token_hash && type) {
    // Email confirmation link — verify and redirect
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.verifyOtp({ token_hash, type: type as any });
    return NextResponse.redirect(`${origin}/studio`);
  }

  // Fallback — redirect to auth page
  return NextResponse.redirect(`${origin}/auth`);
}
