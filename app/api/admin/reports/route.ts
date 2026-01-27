import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// Admin: listar todos los reportes
export async function GET(request: Request) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// Admin: actualizar estado de un reporte
export async function PATCH(request: Request) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'id y status son requeridos' }, { status: 400 });

  const payload: Database['public']['Tables']['reports']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from('reports') as any)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
