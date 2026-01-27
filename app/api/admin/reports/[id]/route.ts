import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// GET: obtener un reporte por id (admin)
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase.from('reports').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH: actualizar estado de un reporte (admin)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { status, resolved_by } = body;
  if (!status) return NextResponse.json({ error: 'status requerido' }, { status: 400 });

  const payload: Database['public']['Tables']['reports']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from('reports') as any)
    .update(payload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
