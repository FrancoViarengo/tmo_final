import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { session, supabase } = await requireSession();
    const uploadId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check permissions (admin/superadmin)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    const role = (profile as any)?.role;
    if (!['admin', 'superadmin'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update upload status
    const { data, error } = await (supabase.from('uploads') as any)
        .update({ status })
        .eq('id', uploadId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
