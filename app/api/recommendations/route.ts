export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

// GET: recomendaciones cacheadas del usuario
export async function GET() {
  const { session, supabase } = await requireSession();
  const { data, error } = await supabase
    .from('recommendation_cache')
    .select('*')
    .eq('user_id', session.user.id)
    .order('score', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
