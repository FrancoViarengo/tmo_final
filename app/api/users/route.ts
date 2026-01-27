export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// GET: lista de usuarios/perfiles públicos (búsqueda opcional)
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = Number(searchParams.get('limit') || 50);

  let query = (supabase.from('profiles') as any).select('id, username, avatar_url, role, reputation, created_at');
  if (q) query = query.ilike('username', `%${q}%`);
  query = query.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
