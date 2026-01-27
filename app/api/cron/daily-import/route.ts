import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Verify Authentication
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Determine Series to Process (Priority: Local Updates -> New Popular)
        const BATCH_SIZE = 10;
        let seriesList: any[] = [];

        // 2a. Fetch "Stale" Local Series (Oldest updated first) to repair/update
        // We fetch their 'external_id' which is the MangaDex ID
        const { data: localSeries } = await (supabaseAdmin.from('series') as any)
            .select('external_id, updated_at')
            .eq('source', 'mangadex')
            .order('updated_at', { ascending: true })
            .limit(BATCH_SIZE);

        const localIds = localSeries?.map((s: any) => s.external_id) || [];

        // Fetch metadata for these local IDs from MangaDex to get fresh info
        if (localIds.length > 0) {
            const idsQuery = localIds.map((id: string) => `ids[]=${id}`).join('&');
            const localMangaRes = await fetch(`https://api.mangadex.org/manga?limit=${BATCH_SIZE}&includes[]=cover_art&includes[]=author&${idsQuery}`);
            if (localMangaRes.ok) {
                const localMangaData = await localMangaRes.json();
                seriesList = [...seriesList, ...localMangaData.data];
            }
        }

        // 2b. Fill remaining slots with New/Popular Series
        const slotsRemaining = BATCH_SIZE - seriesList.length;
        if (slotsRemaining > 0) {
            // Random offset to fetch different series each time (0 to 200)
            const offset = Math.floor(Math.random() * 200);
            const popularUrl = `https://api.mangadex.org/manga?limit=${slotsRemaining}&offset=${offset}&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=es&availableTranslatedLanguage[]=es-la`;

            const popularRes = await fetch(popularUrl);
            if (popularRes.ok) {
                const popularData = await popularRes.json();
                // Filter out duplicates if any random popular one is already in local list
                const newSeries = popularData.data.filter((s: any) => !localIds.includes(s.id));
                seriesList = [...seriesList, ...newSeries];
            }
        }


        let processedCount = 0;
        const errors: any[] = [];

        // 3. Process each series
        for (const manga of seriesList) {
            try {
                const attr = manga.attributes;
                const mangaId = manga.id;

                // Cover URL
                const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
                const fileName = coverRel?.attributes?.fileName;
                const coverUrl = fileName
                    ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
                    : null;

                // Upsert Series
                const { data: series, error: seriesError } = await (supabaseAdmin.from('series') as any)
                    .upsert({
                        title: attr.title.en || Object.values(attr.title)[0] || 'Sin título',
                        description: attr.description.es || attr.description.en || '',
                        slug: `mangadex-${mangaId}`,
                        type: 'Manga',
                        status: attr.status,
                        source: 'mangadex',
                        external_id: mangaId,
                        external_thumbnail: coverUrl,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'slug' })
                    .select()
                    .single();

                if (seriesError) throw seriesError;

                // 4. Fetch ALL Chapters (Spanish) with Pagination
                let chapterOffset = 0;
                let hasMoreChapters = true;
                const CHAPTER_LIMIT = 500; // MangaDex Max per request

                while (hasMoreChapters) {
                    const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=es&translatedLanguage[]=es-la&limit=${CHAPTER_LIMIT}&offset=${chapterOffset}&order[chapter]=desc&includes[]=scanlation_group`;
                    const chaptersRes = await fetch(feedUrl);

                    if (!chaptersRes.ok) {
                        console.error(`Failed to fetch chapters for ${mangaId} (offset ${chapterOffset}): ${chaptersRes.status}`);
                        errors.push({ id: mangaId, error: `Chapter Fetch Failed: ${chaptersRes.status}` });
                        break;
                    }

                    const chaptersData = await chaptersRes.json();
                    const chapters = chaptersData.data;

                    if (!chapters || chapters.length === 0) {
                        hasMoreChapters = false;
                        continue;
                    }

                    // Batch insert this page of chapters
                    const chaptersToInsert = chapters.map((ch: any) => ({
                        series_id: series.id,
                        title: ch.attributes.title,
                        chapter_number: parseFloat(ch.attributes.chapter) || 0,
                        source: 'mangadex',
                        external_id: ch.id,
                        created_at: ch.attributes.publishAt,
                    }));

                    if (chaptersToInsert.length > 0) {
                        const { error: batchError } = await (supabaseAdmin.from('chapters') as any)
                            .upsert(chaptersToInsert, {
                                onConflict: 'series_id, chapter_number',
                                ignoreDuplicates: true
                            });

                        if (batchError) {
                            console.error(`Batch insert error for manga ${mangaId} page ${chapterOffset}:`, batchError);
                            errors.push({ id: mangaId, error: `DB Insert Error: ${batchError.message}` });
                        }
                    }

                    // Check if we need to fetch more
                    if (chapters.length < CHAPTER_LIMIT) {
                        hasMoreChapters = false;
                    } else {
                        chapterOffset += CHAPTER_LIMIT;
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                processedCount++;

                // Rate Limiting
                await new Promise(resolve => setTimeout(resolve, 250));

            } catch (err: any) {
                console.error(`Error processing manga ${manga.id}:`, err);
                errors.push({ id: manga.id, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
