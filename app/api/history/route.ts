import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

// GET: historial del usuario
export async function GET() {
  const { session, supabase } = await requireSession();
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: registrar progreso
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const { series_id, chapter_id, progress_percent } = body;

  if (!series_id || !chapter_id) {
    return NextResponse.json({ error: 'series_id y chapter_id requeridos' }, { status: 400 });
  }

  const { data, error } = await (supabase.from('reading_history') as any)
    .upsert(
      {
        user_id: session.user.id,
        series_id,
        chapter_id,
        progress_percent: progress_percent ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,chapter_id' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
