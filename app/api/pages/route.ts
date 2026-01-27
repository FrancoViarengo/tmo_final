export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// GET: páginas de un capítulo
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapter_id');

  if (!chapterId) {
    return NextResponse.json({ error: 'chapter_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count: data?.length ?? 0 });
}
