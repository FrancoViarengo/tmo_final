import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { session, supabase } = await requireSession();

    const { data, error } = await (supabase.from('lists') as any)
        .select('id, name')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
