import { createServerClient } from '@/lib/supabase/server';
import MangaCard from '@/components/MangaCard';

export const revalidate = 0;

const ITEMS_PER_PAGE = 24;

async function getLibrary(page: number = 1) {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { data: [], count: 0 };

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, count, error } = await supabase
    .from('bookmarks')
    .select('series_id, status, updated_at, series:id ( title, cover_url, external_thumbnail, slug, status, updated_at, type )', { count: 'exact' })
    .eq('user_id', userId)
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}

export default async function LibraryPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const { data: items, count } = await getLibrary(currentPage);
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <h1 className="text-3xl font-bold text-white">Mi Biblioteca</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
              {count} series
            </span>
            <span className="text-sm text-gray-500">
              Página {currentPage} de {totalPages || 1}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card border border-white/5 rounded-lg">
            <p className="text-gray-400 text-lg">
              {currentPage > 1 ? 'No hay más resultados en esta página.' : 'Aún no tienes series guardadas.'}
            </p>
            <div className="mt-4 gap-4 flex justify-center">
              {currentPage > 1 && (
                <a href={`/library?page=${currentPage - 1}`} className="text-primary hover:text-orange-400 font-medium">
                  &larr; Anterior
                </a>
              )}
              <a href="/series" className="text-primary hover:text-orange-400 font-medium">
                Explorar catálogo
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
              {items.map((item: any) => (
                <div key={item.series_id} className="relative group">
                  <MangaCard
                    id={item.series?.slug || item.series_id}
                    title={item.series?.title || 'Sin Título'}
                    coverUrl={item.series?.cover_url || item.series?.external_thumbnail || "https://placehold.co/400x600/1f1f1f/white?text=No+Cover"}
                    type={item.series?.type || "Manga"}
                    score={undefined}
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold text-white rounded shadow-sm ${item.status === 'reading' ? 'bg-blue-600' :
                      item.status === 'completed' ? 'bg-green-600' :
                        item.status === 'dropped' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                      {item.status === 'reading' ? 'Leyendo' :
                        item.status === 'completed' ? 'Completado' :
                          item.status === 'dropped' ? 'Abandonado' : item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-8 border-t border-white/5">
                {currentPage > 1 ? (
                  <a
                    href={`/library?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded transition"
                  >
                    Anterior
                  </a>
                ) : (
                  <span className="px-4 py-2 text-gray-600 cursor-not-allowed">Anterior</span>
                )}

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      // Simple logic to show window around current page could be added here, 
                      // but for now 1-5 or simple range is enough or we keep it simple with Prev/Next
                      // Let's just show simple Prev/Next for robustness and minimal complexity as requested.
                      return null;
                    }
                    return (
                      <a
                        key={p}
                        href={`/library?page=${p}`}
                        className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === p ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                      >
                        {p}
                      </a>
                    );
                  }).filter(Boolean)}
                </div>

                {currentPage < totalPages ? (
                  <a
                    href={`/library?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded transition"
                  >
                    Siguiente
                  </a>
                ) : (
                  <span className="px-4 py-2 text-gray-600 cursor-not-allowed">Siguiente</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
