import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// POST: invitar/agregar miembro al grupo (owner o admin)
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const body = await request.json();
  const { user_id, role: memberRole = 'member' } = body;
  if (!user_id) return NextResponse.json({ error: 'user_id requerido' }, { status: 400 });

  // verificar ownership
  const { data: group } = await supabase
    .from('scanlation_groups')
    .select('owner_id')
    .eq('id', params.id)
    .maybeSingle();

  const isOwner = (group as { owner_id?: string } | null)?.owner_id === session.user.id;
  const adminRole = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isOwner && !isAdminRole(adminRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await (supabase.from('group_members') as any)
    .upsert({ group_id: params.id, user_id, role: memberRole }, { onConflict: 'group_id,user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
