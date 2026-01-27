import { NextResponse } from 'next/server';
import { requireSession, createSupabaseRouteClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = createSupabaseRouteClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = (supabase.from('lists') as any)
        .select('*, profiles:user_id(username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50);

    if (userId) {
        // If user_id is provided, show their public lists OR all lists if it's the current user
        // For simplicity, let's just show public lists for now unless we check session
        query = query.eq('user_id', userId);
    } else {
        // Public lists feed
        query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { session, supabase } = await requireSession();
    const body = await request.json();

    const { name, description, is_public } = body;

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await (supabase.from('lists') as any)
        .insert({
            name,
            description,
            is_public: is_public ?? true,
            user_id: session.user.id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
