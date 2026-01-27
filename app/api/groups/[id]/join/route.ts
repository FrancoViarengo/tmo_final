import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const groupId = params.id;

    // Check if already a member
    const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', session.user.id)
        .single();

    if (existing) {
        return NextResponse.json({ message: 'Already a member' }, { status: 200 });
    }

    // Join group
    const { error } = await (supabase.from('group_members') as any)
        .insert({
            group_id: groupId,
            user_id: session.user.id,
            role: 'member'
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
