import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 0;

async function getHistory() {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('reading_history')
    .select('chapter_id, series_id, progress_percent, updated_at, chapters:id ( chapter_number, title ), series:series_id ( title, slug, cover_url )')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function HistoryPage() {
  const items = await getHistory();

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Historial de Lectura</h1>

        {items.length === 0 && (
          <div className="text-center py-20 bg-card border border-white/5 rounded-lg">
            <p className="text-gray-400 text-lg">No hay historial reciente.</p>
            <a href="/series" className="inline-block mt-4 text-primary hover:text-orange-400 font-medium">
              Comenzar a leer
            </a>
          </div>
        )}

        <div className="space-y-4">
          {items.map((it: any) => (
            <Link
              key={`${it.chapter_id}-${it.series_id}`}
              href={`/reader/${it.series_id}/${it.chapter_id}`}
              className="block rounded-lg border border-white/5 bg-card p-4 hover:border-primary/50 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {it.series?.cover_url ? (
                    <img src={it.series.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={it.series?.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                    {it.series?.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-white font-medium">Capítulo {it.chapters?.chapter_number}</span>
                    {it.chapters?.title && <span className="text-gray-500"> - {it.chapters.title}</span>}
                  </div>

                  <div className="mt-3 w-full max-w-xs bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${it.progress_percent ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex-shrink-0">
                  {it.updated_at ? new Date(it.updated_at).toLocaleDateString() : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
