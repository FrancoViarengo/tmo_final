export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// GET: páginas de un capítulo (mirroring /api/pages but with seriesId/chapterId params)
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapter_id');
  const seriesId = searchParams.get('series_id');

  if (!chapterId || !seriesId) {
    return NextResponse.json({ error: 'chapter_id y series_id son requeridos' }, { status: 400 });
  }

  const { data: chapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('id', chapterId)
    .eq('series_id', seriesId)
    .single();
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
