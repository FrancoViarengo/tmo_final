import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { session, supabase } = await requireSession();

    // Join to fetch group details
    const { data: members, error } = await supabase
        .from('group_members')
        .select(`
            group_id,
            role,
            group:scanlation_groups!inner (
                id,
                name
            )
        `)
        .eq('user_id', session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to simple array of groups
    const groups = members.map((m: any) => ({
        id: m.group.id,
        name: m.group.name,
        role: m.role
    }));

    return NextResponse.json(groups);
}
