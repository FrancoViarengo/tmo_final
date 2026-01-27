export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function GET() {
  const { session, supabase } = await requireSession();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return NextResponse.json({ session, profile });
}
