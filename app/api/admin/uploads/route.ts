import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// GET: todos los uploads (admin)
export async function GET() {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase.from('uploads').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH: actualizar estado de upload
export async function PATCH(request: Request) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, status, error_message } = body;
  if (!id || !status) return NextResponse.json({ error: 'id y status requeridos' }, { status: 400 });

  const payload: Database['public']['Tables']['uploads']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from('uploads') as any)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
