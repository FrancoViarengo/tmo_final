import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';

// GET: lista de comentarios filtrados por serie o capítulo
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('series_id');
  const chapterId = searchParams.get('chapter_id');
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);

  if (!seriesId && !chapterId) {
    return NextResponse.json({ error: 'series_id o chapter_id requerido' }, { status: 400 });
  }

  let query = supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .eq('is_deleted', false);

  if (seriesId) query = query.eq('series_id', seriesId);
  if (chapterId) query = query.eq('chapter_id', chapterId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count: data?.length ?? 0 });
}

// POST: crear comentario
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const { series_id, chapter_id, content, parent_id, is_spoiler } = body;

  if (!series_id || !content) {
    return NextResponse.json({ error: 'series_id y content son requeridos' }, { status: 400 });
  }

  const { data, error } = await (supabase.from('comments') as any)
    .insert({
      user_id: session.user.id,
      series_id,
      chapter_id: chapter_id || null,
      content,
      parent_id: parent_id || null,
      is_deleted: false,
      is_spoiler: Boolean(is_spoiler),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
