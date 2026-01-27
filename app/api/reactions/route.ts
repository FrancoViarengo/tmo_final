import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

const ALLOWED = ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'star'];

// GET: listar reacciones por series_id o chapter_id
export async function GET(request: Request) {
  const supabase = (await import('@/lib/supabase/server')).createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('series_id');
  const chapterId = searchParams.get('chapter_id');
  if (!seriesId && !chapterId) {
    return NextResponse.json({ error: 'series_id o chapter_id requerido' }, { status: 400 });
  }

  let query = (supabase.from('reactions') as any).select('reaction, user_id');
  if (seriesId) query = query.eq('series_id', seriesId);
  if (chapterId) query = query.eq('chapter_id', chapterId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = ((data as any[]) || []).reduce<Record<string, number>>((acc, cur) => {
    acc[cur.reaction] = (acc[cur.reaction] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ data, counts });
}

// POST: toggle reacción
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const { series_id, chapter_id, reaction } = body;
  if (!series_id && !chapter_id) {
    return NextResponse.json({ error: 'series_id o chapter_id requerido' }, { status: 400 });
  }
  if (!reaction || !ALLOWED.includes(reaction)) {
    return NextResponse.json({ error: 'reaction inválida' }, { status: 400 });
  }

  // check existing
  const { data: existing } = await (supabase.from('reactions') as any)
    .select('user_id, reaction')
    .eq('user_id', session.user.id)
    .eq('series_id', series_id || null)
    .eq('chapter_id', chapter_id || null)
    .eq('reaction', reaction)
    .maybeSingle();

  if (existing) {
    const { error } = await (supabase.from('reactions') as any)
      .delete()
      .eq('user_id', session.user.id)
      .eq('series_id', series_id || null)
      .eq('chapter_id', chapter_id || null)
      .eq('reaction', reaction);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reacted: false });
  }

  const { error } = await (supabase.from('reactions') as any).insert({
    user_id: session.user.id,
    series_id: series_id || null,
    chapter_id: chapter_id || null,
    reaction,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reacted: true });
}
