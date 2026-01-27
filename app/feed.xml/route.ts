import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch latest chapters with series info
    const { data: chapters } = await supabase
        .from('chapters')
        .select(`
            id,
            chapter_number,
            title,
            created_at,
            series:series_id (
                id,
                title,
                slug,
                description,
                cover_url
            )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

    const items = chapters?.map((chapter: any) => {
        const seriesTitle = chapter.series?.title || 'Unknown Series';
        const chapterTitle = `Chapter ${chapter.chapter_number}${chapter.title ? ` - ${chapter.title}` : ''}`;
        const link = `${siteUrl}/series/${chapter.series?.id}`;
        const pubDate = new Date(chapter.created_at).toUTCString();
        const description = chapter.series?.description ? escapeXml(chapter.series.description.substring(0, 200) + '...') : '';
        const coverUrl = chapter.series?.cover_url || `${siteUrl}/placeholder.jpg`;

        return `
        <item>
            <title>${escapeXml(seriesTitle)} - ${escapeXml(chapterTitle)}</title>
            <link>${link}</link>
            <guid isPermaLink="true">${link}#chapter-${chapter.chapter_number}</guid>
            <pubDate>${pubDate}</pubDate>
            <description>${description}</description>
            <media:content url="${escapeXml(coverUrl)}" medium="image" />
        </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>NeoManga Releases</title>
        <link>${siteUrl}</link>
        <description>Latest manga releases from NeoManga</description>
        <language>es</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
        ${items || ''}
    </channel>
</rss>`;

    return new NextResponse(rss, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
