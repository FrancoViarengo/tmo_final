export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';
import { Database } from '@/lib/database.types';

// GET: listar usuarios (admin)
export async function GET() {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as { role?: Database['public']['Enums']['app_role'] } | null)?.role;
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await (supabase.from('profiles') as any).select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
