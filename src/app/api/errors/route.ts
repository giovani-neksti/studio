import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stack, source, url, metadata } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Optional: extract user from token
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id ?? null;
    }

    await supabaseAdmin.from('error_logs').insert({
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 5000) : null,
      source: source ? String(source).slice(0, 100) : null,
      url: url ? String(url).slice(0, 500) : null,
      user_id: userId,
      user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error logging failed:', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
