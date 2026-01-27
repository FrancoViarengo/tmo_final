import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole } from '@/lib/auth/guards';

// GET: configuración (solo admin puede leer)
export async function GET() {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as any)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await (supabase.from('system_settings') as any).select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: upsert settings (admin)
export async function POST(request: Request) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as any)?.role;
  if (!isAdminRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  // body should be { key, value }
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key requerido' }, { status: 400 });

  const { data, error } = await (supabase.from('system_settings') as any)
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
