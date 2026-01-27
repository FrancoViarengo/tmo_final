import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const groupId = params.id;

    const { error } = await (supabase.from('group_followers') as any)
        .insert({
            user_id: session.user.id,
            group_id: groupId,
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            return NextResponse.json({ message: 'Already following' });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const groupId = params.id;

    const { error } = await (supabase.from('group_followers') as any)
        .delete()
        .match({
            user_id: session.user.id,
            group_id: groupId,
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
