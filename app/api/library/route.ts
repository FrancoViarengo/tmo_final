import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

// GET: obtener biblioteca del usuario
export async function GET() {
  const { session, supabase } = await requireSession();
  const { data, error } = await supabase
    .from('bookmarks')
    .select('series_id, status, updated_at')
    .eq('user_id', session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: agregar/actualizar bookmark
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const { series_id, status } = body;
  if (!series_id) return NextResponse.json({ error: 'series_id requerido' }, { status: 400 });

  const { data, error } = await (supabase.from('bookmarks') as any)
    .upsert(
      {
        user_id: session.user.id,
        series_id,
        status: status || 'reading',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,series_id' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE: remover bookmark
export async function DELETE(request: Request) {
  const { session, supabase } = await requireSession();
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('series_id');
  if (!seriesId) return NextResponse.json({ error: 'series_id requerido' }, { status: 400 });

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', session.user.id)
    .eq('series_id', seriesId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
