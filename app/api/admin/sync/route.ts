import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow longer timeout for full sync

export async function POST(request: Request) {
    const { session } = await requireSession(); // Ensure user is logged in

    // Check specific role if needed, or rely on RLS/Admin check logic
    // For MVP, assuming any logged in 'admin'/'uploader' can trigger sync is verified by UI/App logic mostly

    const body = await request.json();
    const { series_id } = body; // This expects the internal UUID or external ID? Let's genericize.

    if (!series_id) {
        return NextResponse.json({ error: 'Series ID required' }, { status: 400 });
    }

    const supabase = createSupabaseRouteClient();

    // 1. Get Series Info to find External ID
    const { data: series, error: sErr } = await supabase
        .from('series')
        .select('id, external_id, source')
        .eq('id', series_id)
        .single();

    if (sErr || !series) {
        return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    if ((series as any).source !== 'mangadex' || !(series as any).external_id) {
        return NextResponse.json({ error: 'Only MangaDex series are supported for Smart Sync' }, { status: 400 });
    }

    const mangaId = (series as any).external_id;

    try {
        // 2. Fetch Fresh Metadata
        const mangaRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
        if (!mangaRes.ok) throw new Error("MangaDex API Error");
        const mangaData = await mangaRes.json();
        const attr = mangaData.data.attributes;

        // Update Series Metadata
        await (supabase.from('series') as any).update({
            title: attr.title.en || Object.values(attr.title)[0],
            status: attr.status,
            updated_at: new Date().toISOString(),
        }).eq('id', (series as any).id);


        // 3. Fetch ALL Chapters (Pagination Loop)
        let totalInserted = 0;
        let offset = 0;
        const limit = 500;
        let hasMore = true;

        while (hasMore) {
            const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=es&translatedLanguage[]=es-la&limit=${limit}&offset=${offset}&order[chapter]=desc&includes[]=scanlation_group`;
            const chaptersRes = await fetch(feedUrl);
            if (!chaptersRes.ok) break;

            const chaptersData = await chaptersRes.json();
            const pageChapters = chaptersData.data || [];

            if (pageChapters.length > 0) {
                const chaptersToInsert = pageChapters.map((ch: any) => ({
                    series_id: (series as any).id,
                    title: ch.attributes.title,
                    chapter_number: parseFloat(ch.attributes.chapter) || 0,
                    source: 'mangadex',
                    external_id: ch.id,
                    created_at: ch.attributes.publishAt,
                    uploader_id: session.user.id
                }));

                const { error: batchError } = await (supabase.from('chapters') as any)
                    .upsert(chaptersToInsert, {
                        onConflict: 'external_id',
                        ignoreDuplicates: true
                    });

                if (batchError) console.error("Sync Batch Error:", batchError);
                else totalInserted += chaptersToInsert.length;
            }

            if (pageChapters.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
                await new Promise(r => setTimeout(r, 100));
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${totalInserted} chapters`,
            count: totalInserted
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
