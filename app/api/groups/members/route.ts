import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// GET: miembros de un grupo (requiere group_id)
export async function GET(request: Request) {
  const { supabase, session } = await requireSessionWithProfile();
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('group_id');
  if (!groupId) return NextResponse.json({ error: 'group_id requerido' }, { status: 400 });

  // permitir ver si es miembro, owner o admin
  const { data: membership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  const { data: group } = await (supabase.from('scanlation_groups') as any).select('owner_id').eq('id', groupId).maybeSingle();

  const canView = membership || (group as { owner_id?: string } | null)?.owner_id === session.user.id;
  if (!canView) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, role, created_at')
    .eq('group_id', groupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: agregar miembro (owner/admin)
export async function POST(request: Request) {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const body = await request.json();
  const { group_id, user_id, role = 'member' } = body;
  if (!group_id || !user_id) return NextResponse.json({ error: 'group_id y user_id requeridos' }, { status: 400 });

  const { data: group } = await (supabase.from('scanlation_groups') as any).select('owner_id').eq('id', group_id).maybeSingle();
  const isOwner = (group as { owner_id?: string } | null)?.owner_id === session.user.id;
  const adminRole = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isOwner && !isAdminRole(adminRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await (supabase.from('group_members') as any)
    .upsert({ group_id, user_id, role }, { onConflict: 'group_id,user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE: remover miembro
export async function DELETE(request: Request) {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('group_id');
  const userId = searchParams.get('user_id');
  if (!groupId || !userId) return NextResponse.json({ error: 'group_id y user_id requeridos' }, { status: 400 });

  const { data: group } = await (supabase.from('scanlation_groups') as any).select('owner_id').eq('id', groupId).maybeSingle();
  const isOwner = (group as { owner_id?: string } | null)?.owner_id === session.user.id;
  const adminRole = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isOwner && !isAdminRole(adminRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await (supabase.from('group_members') as any)
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
