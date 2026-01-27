import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

// GET: reportes del usuario
export async function GET() {
  const { session, supabase } = await requireSession();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: crear reporte
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const { target_id, reason, target_type, description } = body;

  if (!target_id || !reason || !target_type) {
    return NextResponse.json({ error: 'target_id, reason y target_type son requeridos' }, { status: 400 });
  }

  const { data, error } = await (supabase.from('reports') as any)
    .insert({
      reporter_id: session.user.id,
      target_id,
      reason,
      status: 'pending',
      description: description || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
