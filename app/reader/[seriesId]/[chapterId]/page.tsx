import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ReaderClient from './reader-client';
import GiscusThread from '@/components/GiscusThread';
import AdUnit from '@/components/AdUnit';

async function getChapter(seriesId: string, chapterId: string) {
  const supabase = createServerClient();

  // Fetch metadata first
  const { data: chapterRaw, error } = await supabase
    .from('chapters')
    .select('id, series_id, title, chapter_number, source, external_id')
    .eq('id', chapterId)
    .eq('series_id', seriesId)
    .single();

  if (error || !chapterRaw) return null;
  const chapter = chapterRaw as any;

  let pages: any[] = [];

  // If local, fetch from pages table
  if (chapter.source === 'local' || !chapter.source) {
    const { data: localPages } = await supabase
      .from('pages')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('page_number', { ascending: true });
    pages = localPages || [];
  }
  // If MangaDex, fetch from their API
  else if (chapter.source === 'mangadex' && chapter.external_id) {
    try {
      const mdRes = await fetch(`https://api.mangadex.org/at-home/server/${chapter.external_id}`);
      if (mdRes.ok) {
        const mdData = await mdRes.json();
        const baseUrl = mdData.baseUrl;
        const hash = mdData.chapter.hash;
        const files = mdData.chapter.data;

        pages = files.map((file: string, index: number) => ({
          id: `md-${index}`,
          page_number: index + 1,
          image_url: `${baseUrl}/data/${hash}/${file}`
        }));

        // Handle External Chapters (MangaPlus, etc.)
        if (files.length === 0) {
          const metaRes = await fetch(`https://api.mangadex.org/chapter/${chapter.external_id}`);
          if (metaRes.ok) {
            const meta = await metaRes.json();
            if (meta.data?.attributes?.externalUrl) {
              return { chapter, pages: [], externalUrl: meta.data.attributes.externalUrl };
            }
          }
        }
      }
    } catch (e) {
      console.error("Error fetching MangaDex pages", e);
    }
  }

  return { chapter, pages };
}

export default async function ReaderPage({ params }: { params: { seriesId: string; chapterId: string } }) {
  const data = await getChapter(params.seriesId, params.chapterId);
  if (!data) return notFound();

  const { chapter, pages, externalUrl } = data as any;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const giscusId = `chapter-${chapter.id}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReaderClient
        chapterId={chapter.id}
        seriesId={chapter.series_id || ''}
        chapterTitle={chapter.title || 'Sin título'}
        chapterNumber={chapter.chapter_number}
        pages={pages}
        externalUrl={externalUrl}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-card border border-white/5 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Comentarios del capítulo</h2>
          <GiscusThread
            identifier={giscusId}
            title={`${chapter.title || 'Capítulo'} ${chapter.chapter_number}`}
            url={`${siteUrl}/reader/${chapter.series_id}/${chapter.id}`}
            mapping="pathname"
          />
        </div>

        <div className="mt-8">
          <AdUnit slot="content" className="rounded-2xl" />
        </div>

      </div>
    </main>
  );
}
