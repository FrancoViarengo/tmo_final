import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';

// GET: obtener comentario
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseRouteClient();
  const { data, error } = await (supabase.from('comments') as any).select('*').eq('id', params.id).single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH: actualizar comentario (propietario o admin)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { session, supabase } = await requireSession();
  const body = await request.json();

  const { data: comment } = await (supabase.from('comments') as any).select('user_id').eq('id', params.id).maybeSingle();
  const ownerId = (comment as { user_id?: string } | null)?.user_id;
  if (!ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
  const role = (profile as { role?: 'admin' | 'superadmin' } | null)?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';
  if (ownerId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await (supabase.from('comments') as any)
    .update({ content: body.content, is_deleted: Boolean(body.is_deleted) })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE: soft delete (propietario o admin)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { session, supabase } = await requireSession();

  const { data: comment } = await (supabase.from('comments') as any).select('user_id').eq('id', params.id).maybeSingle();
  const ownerId = (comment as { user_id?: string } | null)?.user_id;
  if (!ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
  const role = (profile as { role?: 'admin' | 'superadmin' } | null)?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';
  if (ownerId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await (supabase.from('comments') as any)
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
