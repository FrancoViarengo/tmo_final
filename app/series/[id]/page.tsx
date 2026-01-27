import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import GiscusThread from '@/components/GiscusThread';
import EditSeriesButton from './EditSeriesButton';
import AddToListButton from '@/components/AddToListButton';
import AdUnit from '@/components/AdUnit';
import ReportModal from '@/components/ReportModal';
import { Metadata } from 'next';

export const revalidate = 3600;

interface Series {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  external_thumbnail?: string | null;
  type: string;
  status: string;
  language: string;
  updated_at: string;
  tags: string[];
  chapters: {
    id: string;
    title: string;
    chapter_number: number;
    created_at: string;
  }[];
}

async function getSeries(id: string): Promise<Series | null> {
  const supabase = createServerClient();
  // Try by slug first
  let { data, error } = await supabase
    .from('series')
    .select('*, chapters:chapters!chapters_series_id_fkey(id, title, chapter_number, created_at)')
    .eq('slug', id)
    .single();

  if (!data) {
    // Try by ID
    const { data: dataById, error: errorById } = await supabase
      .from('series')
      .select('*, chapters:chapters!chapters_series_id_fkey(id, title, chapter_number, created_at)')
      .eq('id', id)
      .single();
    data = dataById;
    error = errorById;
  }

  if (error || !data) return null;

  // Sort chapters
  if ((data as any)?.chapters) {
    (data as any).chapters.sort((a: any, b: any) => b.chapter_number - a.chapter_number);
  }

  return data as Series;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const series = await getSeries(params.id);
  if (!series) return { title: 'Serie no encontrada' };

  return {
    title: series.title,
    description: series.description || `Lee ${series.title} online gratis en TMO Clone.`,
    openGraph: {
      title: series.title,
      description: series.description || `Lee ${series.title} online gratis.`,
      images: [series.cover_url || series.external_thumbnail || ''],
    },
  };
}

export default async function SeriesDetailsPage({ params }: { params: { id: string } }) {
  const series = await getSeries(params.id);

  if (!series) {
    return <div className="text-center py-20 text-white">Serie no encontrada</div>;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const pageUrl = `${siteUrl}/series/${series.slug || series.id}`;
  const giscusId = `series-${series.id}`;

  return (
    <main className="min-h-screen pb-12">
      {/* Banner / Backdrop */}
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <img
          src={series.cover_url || series.external_thumbnail || "https://placehold.co/1920x400/1f1f1f/white?text=Banner"}
          alt="Banner"
          className="w-full h-full object-cover opacity-30 blur-sm"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="aspect-[2/3] bg-card rounded-lg shadow-2xl overflow-hidden border border-white/10">
              {series.cover_url || series.external_thumbnail ? (
                <img src={series.cover_url || series.external_thumbnail!} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Sin portada</div>
              )}
            </div>

            <div className="bg-card border border-white/5 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Tipo</span>
                <span className="font-semibold text-white uppercase">{series.type || 'Manga'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Estado</span>
                <span className="font-semibold text-primary uppercase">{series.status || 'ongoing'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Idioma</span>
                <span className="font-semibold text-white uppercase">{series.language || 'es'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Actualizado</span>
                <span className="text-white">{series.updated_at ? new Date(series.updated_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          <AdUnit slot="sidebar" className="rounded-lg shadow-sm" />
        </div>

        {/* Main Content */}
        <div className="space-y-8 pt-8 md:pt-0">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">{series.title}</h1>
              <ReportModal contentId={series.id} contentType="series" />
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.isArray(series.tags) && series.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-300 text-xs rounded-full border border-white/5 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
            {series.description && (
              <p className="text-gray-300 leading-relaxed text-lg">{series.description}</p>
            )}

            <div className="mt-4 flex gap-3">
              <AddToListButton seriesId={series.id} />
              <EditSeriesButton id={series.id} />
            </div>
          </div>

          {/* Chapters List */}
          <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Lista de Capítulos
              </h2>
              <span className="text-sm text-gray-400 bg-black/20 px-2 py-1 rounded">{series.chapters.length} caps</span>
            </div>

            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {series.chapters.map((ch: any) => (
                <a
                  key={ch.id}
                  href={`/reader/${series.id}/${ch.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded text-gray-400 text-sm font-mono group-hover:bg-primary group-hover:text-white transition-colors">
                      #{ch.chapter_number}
                    </span>
                    <div>
                      <span className="block font-medium text-white group-hover:text-primary transition-colors">
                        Capítulo {ch.chapter_number}
                      </span>
                      {ch.title && <span className="text-sm text-gray-500">{ch.title}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {ch.created_at ? new Date(ch.created_at).toLocaleDateString() : ''}
                  </span>
                </a>
              ))}
              {series.chapters.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No hay capítulos disponibles por el momento.
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-card border border-white/5 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">Comentarios</h2>
            <GiscusThread identifier={giscusId} title={series.title} url={pageUrl} mapping="pathname" />
          </div>
        </div>
      </div>
    </main>
  );
}
