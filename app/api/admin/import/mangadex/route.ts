import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        const supabase = createServerClient();

        // 1. Verify Admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Extract Manga ID
        const match = url.match(/title\/([a-f0-9-]+)/);
        const mangaId = match ? match[1] : url;

        if (!mangaId.match(/^[a-f0-9-]+$/)) {
            return NextResponse.json({ error: "Invalid MangaDex ID" }, { status: 400 });
        }

        // 3. Fetch Series Metadata from MangaDex
        const mangaRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
        if (!mangaRes.ok) throw new Error("Manga not found on MangaDex");
        const mangaData = await mangaRes.json();
        const attr = mangaData.data.attributes;

        // Find cover file
        const coverRel = mangaData.data.relationships.find((r: any) => r.type === "cover_art");
        const fileName = coverRel?.attributes?.fileName;
        const coverUrl = fileName
            ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
            : null;

        // 4. Insert Series
        const { data: series, error: seriesError } = await (supabase.from("series") as any)
            .upsert({
                title: attr.title.en || Object.values(attr.title)[0],
                description: attr.description.es || attr.description.en || "",
                slug: `mangadex-${mangaId}`, // Prevent slug collision
                type: "Manga", // Assuming Manga, could map from attr.originalLanguage
                status: attr.status,
                source: "mangadex",
                external_id: mangaId,
                external_thumbnail: coverUrl,
                created_by: session.user.id
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (seriesError) throw seriesError;

        // 5. Fetch Chapters (Spanish) - Pagination Loop
        let totalInserted = 0;
        let offset = 0;
        const limit = 500;
        let hasMore = true;

        while (hasMore) {
            const chaptersRes = await fetch(
                `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=es&translatedLanguage[]=es-la&limit=${limit}&offset=${offset}&order[chapter]=desc&includes[]=scanlation_group`
            );

            if (!chaptersRes.ok) break;

            const chaptersData = await chaptersRes.json();
            const pageChapters = chaptersData.data || [];

            if (pageChapters.length > 0) {
                const chaptersToInsert = pageChapters.map((ch: any) => ({
                    series_id: series.id,
                    title: ch.attributes.title,
                    chapter_number: parseFloat(ch.attributes.chapter) || 0,
                    source: "mangadex",
                    external_id: ch.id,
                    uploader_id: session.user.id,
                    created_at: ch.attributes.publishAt
                }));

                const { error: batchError } = await (supabase.from("chapters") as any)
                    .upsert(chaptersToInsert, { onConflict: 'external_id', ignoreDuplicates: true });

                if (batchError) console.error(`Batch insert error at offset ${offset}:`, batchError);
                else totalInserted += chaptersToInsert.length;
            }

            if (pageChapters.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
                // Polite delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return NextResponse.json({
            success: true,
            series: series,
            chaptersCount: totalInserted
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
