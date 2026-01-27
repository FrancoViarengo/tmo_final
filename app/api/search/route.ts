export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// Búsqueda simple por título
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = Number(searchParams.get('limit') || 20);

  if (!q) return NextResponse.json({ data: [] });

  const { data, error } = await supabase
    .from('series')
    .select('*')
    .ilike('title', `%${q}%`)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
