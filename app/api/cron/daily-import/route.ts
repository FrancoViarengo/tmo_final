import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log("Worker: Checking Auth...");
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const isServiceRole = key?.includes('service_role'); // Heuristic check if ENV var name implies it (Wait, no, the CONTENT of the key matter)
        // Check if the JWT contains 'service_role' payload? No easy way to decode without lib.

        console.log(`Worker: Service Key configured. Length: ${key?.length}`);

        // Debug visibility
        const { count: debugCount, data: debugRows, error: debugErr } = await supabaseAdmin
            .from('sync_queue')
            .select('external_id, status, type')
            .limit(10);

        console.log(`Worker: VISIBILITY TEST - visible: ${debugCount}, Error: ${debugErr?.message}`);
        console.log("Worker: Sample Rows:", JSON.stringify(debugRows));

        // 1. Auth Guard
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. DISCOVERY: Seed the queue if it's low
        const { count: queueCount, error: countErr } = await (supabaseAdmin.from('sync_queue') as any)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        console.log(`Worker: Queue Count (Pending): ${queueCount}, Error: ${countErr?.message}`);

        if ((queueCount || 0) < 20) {
            console.log("Queue low, seeding with popular series...");
            const offset = Math.floor(Math.random() * 500);
            const popularRes = await fetch(`https://api.mangadex.org/manga?limit=50&offset=${offset}&availableTranslatedLanguage[]=es&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`);

            if (popularRes.ok) {
                const popularData = await popularRes.json();
                const seeds = popularData.data.map((m: any) => ({
                    external_id: m.id,
                    type: 'series',
                    priority: 5,
                    metadata: { title: m.attributes.title.en || Object.values(m.attributes.title)[0] }
                }));
                await (supabaseAdmin.from('sync_queue') as any).upsert(seeds, { onConflict: 'external_id, type', ignoreDuplicates: true });
            }
        }

        // 3. PROCESSOR: Pick a batch of tasks (Fetch broader scope and filter in memory to bypass DB filter glitches)
        const BATCH_SIZE = 50; // Fetch more to find pending ones
        const { data: rawTasks, error: taskErr } = await (supabaseAdmin.from('sync_queue') as any)
            .select('*')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

        // In-memory filter
        const tasks = rawTasks ? rawTasks.filter((t: any) => t.status === 'pending').slice(0, 5) : [];

        if (taskErr || !tasks || tasks.length === 0) {
            console.log("Worker: No pending tasks found (in-memory filtered).");
            return NextResponse.json({ success: true, message: "Queue empty" });
        }

        console.log(`Worker: Processing ${tasks.length} tasks...`);
        const results = [];

        for (const task of tasks) {
            try {
                console.log(`Worker: processing task ${task.id} (${task.type}: ${task.external_id})`);
                // Mark as processing
                await (supabaseAdmin.from('sync_queue') as any).update({ status: 'processing', attempts: task.attempts + 1 }).eq('id', task.id);

                if (task.type === 'series') {
                    // Sync Metadata & Create Chapter tasks
                    const mangaRes = await fetch(`https://api.mangadex.org/manga/${task.external_id}?includes[]=cover_art`);
                    if (!mangaRes.ok) throw new Error(`MD Error: ${mangaRes.status}`);

                    const m = (await mangaRes.json()).data;
                    const attr = m.attributes;
                    const coverRel = m.relationships.find((r: any) => r.type === 'cover_art');
                    const coverUrl = coverRel ? `https://uploads.mangadex.org/covers/${m.id}/${coverRel.attributes.fileName}.256.jpg` : null;

                    const { data: series, error: upsertErr } = await (supabaseAdmin.from('series') as any).upsert({
                        title: attr.title.en || Object.values(attr.title)[0],
                        description: attr.description.es || attr.description.en || '',
                        slug: `mangadex-${m.id}`,
                        source: 'mangadex',
                        external_id: m.id,
                        external_thumbnail: coverUrl,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'external_id' }).select().single();

                    if (!series) {
                        throw new Error(`Failed to create/fetch series: ${attr.title.en || 'Unknown'} (SysError: ${upsertErr?.message})`);
                    }

                    // Queue chapter sync starting from offset 0
                    await (supabaseAdmin.from('sync_queue') as any).upsert({
                        external_id: m.id,
                        type: 'chapters',
                        priority: 10, // Higher priority for existing series
                        metadata: { offset: 0, internal_id: series.id }
                    }, { onConflict: 'external_id, type' });

                    await (supabaseAdmin.from('sync_queue') as any).update({ status: 'completed' }).eq('id', task.id);
                    results.push({ id: task.external_id, status: 'synced_meta' });

                } else if (task.type === 'chapters') {
                    // Sync ONE page of chapters
                    const offset = task.metadata?.offset || 0;
                    const limit = 100;
                    const internalId = task.metadata?.internal_id;

                    const feedRes = await fetch(`https://api.mangadex.org/manga/${task.external_id}/feed?translatedLanguage[]=es&translatedLanguage[]=es-la&limit=${limit}&offset=${offset}&order[chapter]=desc`);
                    if (!feedRes.ok) throw new Error(`MD Feed Error: ${feedRes.status}`);

                    const feedData = await feedRes.json();
                    const chapters = feedData.data || [];

                    if (chapters.length > 0) {
                        const toInsert = chapters.map((ch: any) => ({
                            series_id: internalId,
                            chapter_number: parseFloat(ch.attributes.chapter) || 0,
                            title: ch.attributes.title,
                            source: 'mangadex',
                            external_id: ch.id,
                            created_at: ch.attributes.publishAt
                        }));

                        await (supabaseAdmin.from('chapters') as any).upsert(toInsert, { onConflict: 'external_id', ignoreDuplicates: true });

                        if (chapters.length === limit) {
                            // More chapters exist, update queue with new offset
                            await (supabaseAdmin.from('sync_queue') as any).update({
                                metadata: { ...task.metadata, offset: offset + limit },
                                status: 'pending' // Put back to pending for next cycle
                            }).eq('id', task.id);
                        } else {
                            await (supabaseAdmin.from('sync_queue') as any).update({ status: 'completed' }).eq('id', task.id);
                        }
                        results.push({ id: task.external_id, status: `synced_chapters_page_${offset / limit}` });
                    } else {
                        await (supabaseAdmin.from('sync_queue') as any).update({ status: 'completed' }).eq('id', task.id);
                        results.push({ id: task.external_id, status: 'no_more_chapters' });
                    }
                }

                await new Promise(r => setTimeout(r, 200));

            } catch (e: any) {
                console.error(`Error in task ${task.id}:`, e);
                await (supabaseAdmin.from('sync_queue') as any).update({ status: 'error', last_error: e.message }).eq('id', task.id);
            }
        }

        return NextResponse.json({ success: true, processed: results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

