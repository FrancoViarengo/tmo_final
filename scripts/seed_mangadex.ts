
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback to anon (might fail if RLS blocks)

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MANGA_IDS = [
    "a1c7c817-4e59-43b7-9365-096758918370", // One Piece
    "c52b2ce3-7f95-469c-96b0-479524fb7a1a", // Jujutsu Kaisen
    "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b", // Chainsaw Man
    "296cbc31-af1a-4b5b-a34b-fee2b4cad542", // Oshi no Ko
    "e78a489b-6632-4d61-b00b-5206f5b8b22b", // Spy x Family
    "801513ba-a712-498c-8f57-cae55b38cc92", // Berserk
    "58e93ec7-8736-4a94-b258-292a8323631f", // Vinland Saga
    "4e7a4a6f-83c1-4034-8464-9f3b14562470", // Blue Lock
    "d8f9afe2-80da-498c-87d7-832130e3952f", // Dandadan
    "3948b87d-089c-48c2-a400-84a51e66c757"  // Vagabond (replacing MHA for variety)
];

// Helper for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function importManga(mangaId: string) {
    console.log(`Processing ${mangaId}...`);
    try {
        // 1. Fetch Metadata (with retry and UA)
        const mangaRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`, {
            headers: { "User-Agent": "NeoMangaSeed/1.0" }
        });

        if (!mangaRes.ok) {
            console.error(`Failed to fetch manga ${mangaId}: ${mangaRes.statusText}`);
            return;
        }
        const mangaData = await mangaRes.json();
        const attr = mangaData.data.attributes;

        // Cover
        const coverRel = mangaData.data.relationships.find((r: any) => r.type === "cover_art");
        const fileName = coverRel?.attributes?.fileName;
        const coverUrl = fileName
            ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
            : null;

        const title = attr.title.es || attr.title.en || Object.values(attr.title)[0];
        const description = attr.description.es || attr.description.en || "";

        // 2. Insert Series
        const { data: series, error: seriesError } = await supabase
            .from("series")
            .upsert({
                title: title,
                description: description,
                slug: `mangadex-${mangaId}`,
                type: "Manga",
                status: attr.status,
                source: "mangadex",
                external_id: mangaId,
                external_thumbnail: coverUrl,
                // Using upsert on slug works because slug has a UNIQUE constraint
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (seriesError) {
            // Fallback: Try to get user if FK fails
            if (seriesError.code === '23503') {
                const { data: users } = await supabase.from('profiles').select('id').limit(1);
                if (users && users.length > 0) {
                    const { data: retrySeries } = await supabase.from("series").upsert({
                        title: title,
                        description: description,
                        slug: `mangadex-${mangaId}`,
                        type: "Manga",
                        status: attr.status,
                        source: "mangadex",
                        external_id: mangaId,
                        external_thumbnail: coverUrl,
                        created_by: users[0].id
                    }, { onConflict: 'slug' }).select().single();

                    if (retrySeries) {
                        console.log(`Saved (Retried) ${title}`);
                        await processChapters(retrySeries, mangaId);
                    }
                }
            } else {
                console.error(`Error saving ${title}:`, seriesError.message);
            }
            return;
        }

        if (series) {
            console.log(`Saved Series: ${title}`);
            await processChapters(series, mangaId);
        }

    } catch (error: any) {
        console.error(`Critical Error for ${mangaId}:`, error.message);
    }
}

async function processChapters(series: any, mangaId: string) {
    // 3. Fetch Chapters
    await delay(1000); // Rate limit guard
    const chaptersRes = await fetch(
        `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=es&translatedLanguage[]=es-la&limit=50&order[chapter]=desc&includes[]=scanlation_group`,
        { headers: { "User-Agent": "NeoMangaSeed/1.0" } }
    );
    const chaptersData = await chaptersRes.json();
    const chapters = chaptersData.data;

    if (!chapters || chapters.length === 0) {
        console.log("No Spanish chapters found.");
        return;
    }

    const ownerId = series.created_by;

    // Filter existing chapters to avoid "ON CONFLICT" error (since external_id might not be UNIQUE in DB yet)
    const externalIds = chapters.map((ch: any) => ch.id);
    const { data: existingChapters } = await supabase
        .from('chapters')
        .select('external_id')
        .in('external_id', externalIds);

    const existingSet = new Set(existingChapters?.map(c => c.external_id));

    const chaptersToInsert = chapters
        .filter((ch: any) => !existingSet.has(ch.id))
        .map((ch: any) => ({
            series_id: series.id,
            title: ch.attributes.title,
            chapter_number: parseFloat(ch.attributes.chapter) || 0,
            source: "mangadex",
            external_id: ch.id,
            uploader_id: ownerId
        }));

    if (chaptersToInsert.length > 0) {
        const { error: chError } = await supabase.from("chapters").insert(chaptersToInsert);
        if (chError) console.error("Chapter Error:", chError.message);
        else console.log(`Scanner: Added ${chaptersToInsert.length} new chapters.`);
    } else {
        console.log("Scanner: No new chapters to add.");
    }
}

async function run() {
    console.log("Starting Seed...");
    for (const id of MANGA_IDS) {
        await importManga(id);
    }
    console.log("Done!");
}

run();
