import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const { manga_id, priority = 100 } = await request.json();

        if (!manga_id) {
            return NextResponse.json({ error: 'manga_id is required' }, { status: 400 });
        }

        const supabase = createSupabaseRouteClient();

        // 1. Add to queue with high priority
        const { data, error } = await (supabase.from('sync_queue') as any).upsert({
            external_id: manga_id,
            type: 'series',
            priority: priority,
            status: 'pending',
            metadata: { manual_trigger: true }
        }, { onConflict: 'external_id', ignoreDuplicates: false }).select().single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Manga ${manga_id} added to priority queue. NeoSync will process it shortly.`,
            task: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
