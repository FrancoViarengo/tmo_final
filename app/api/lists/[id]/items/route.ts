import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const listId = params.id;
    const body = await request.json();
    const { series_id } = body;

    if (!series_id) {
        return NextResponse.json({ error: 'series_id required' }, { status: 400 });
    }

    // Verify ownership of list
    const { data: list } = await supabase
        .from('lists')
        .select('user_id')
        .eq('id', listId)
        .single();

    if (!list || (list as any).user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add item
    const { error } = await (supabase.from('list_items') as any)
        .insert({
            list_id: listId,
            series_id: series_id,
        });

    if (error) {
        // Ignore duplicate key error (already in list)
        if (error.code === '23505') {
            return NextResponse.json({ message: 'Already in list' });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
