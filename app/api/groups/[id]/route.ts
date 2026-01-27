import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const body = await request.json();
    const { name, website, discord, description, recruitment_status, recruitment_description } = body;

    // Verify ownership/leadership
    const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', params.id)
        .eq('user_id', session.user.id)
        .single();

    if (!membership || (membership as any).role !== 'leader') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update group
    const { data, error } = await (supabase.from('scanlation_groups') as any)
        .update({
            name,
            website,
            discord,
            description,
            recruitment_status, // 'open' or 'closed'
            recruitment_description
        })
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
