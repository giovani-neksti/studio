import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 60; // ISR — revalida a cada 60s

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('id, original_image_url, generated_image_url, niche, created_at')
      .not('original_image_url', 'is', null)
      .not('generated_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Return only image URLs — no user data (anonymous)
    const items = (data || []).map((g) => ({
      id: g.id,
      before: g.original_image_url,
      after: g.generated_image_url,
      niche: g.niche,
    }));

    return NextResponse.json({ items }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
