import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// PATCH: actualizar rol de usuario (admin)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase, profile } = await requireSessionWithProfile();
  const currentRole = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(currentRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { role } = body;
  if (!role) return NextResponse.json({ error: 'role requerido' }, { status: 400 });

  const payload: Database['public']['Tables']['profiles']['Update'] = { role };

  const { data, error } = await (supabase.from('profiles') as any)
    .update(payload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
