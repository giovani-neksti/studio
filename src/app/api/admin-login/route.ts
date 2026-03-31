import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = [
  'giovani@neksti.com.br',
  'lucas@neksti.com.br',
  'jefferson@neksti.com.br',
];

const ADMIN_PASSWORD = process.env.ADMIN_BYPASS_PASSWORD || '';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Bypass não configurado' }, { status: 500 });
    }

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Check if user exists, if not create with password
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      // Create user with password
      const { error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
      });
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
    } else {
      // Update existing user's password to ensure it matches
      await supabase.auth.admin.updateUserById(userExists.id, {
        password,
      });
    }

    // Return credentials — the client will use signInWithPassword
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
