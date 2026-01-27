import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// GET: notificaciones del usuario (incluye conteo no leídas)
export async function GET() {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // si no hay sesión, devolver vacío sin error
  if (!session) {
    return NextResponse.json({ data: [], unread: 0 });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const unread = ((data as any[]) || []).filter((n) => !n.read_at).length;
  return NextResponse.json({ data, unread });
}

// PATCH: marcar como leídas
export async function PATCH(request: Request) {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const ids: string[] | undefined = body.ids;
  const readAll: boolean = body.read_all === true;

  let query = (supabase.from('notifications') as any)
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', session.user.id);
  if (!readAll && ids?.length) {
    query = query.in('id', ids);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
