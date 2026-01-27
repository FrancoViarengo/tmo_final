import { createServerClient } from '@/lib/supabase/server';
import MangaCard from '@/components/MangaCard';

export const revalidate = 30;

interface Series {
  id: string;
  title: string;
  cover_url: string | null;
  external_thumbnail?: string | null;
  status: string;
  type: 'Manga' | 'Manhwa' | 'Manhua' | 'Novel' | 'One Shot' | 'Doujinshi';
  slug: string;
  updated_at: string;
}

async function getSeries(searchParams: { q?: string; status?: string; type?: string }): Promise<Series[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('series')
    .select('id, title, cover_url, external_thumbnail, status, type, slug, updated_at')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(500);

  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.type) query = query.eq('type', searchParams.type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as Series[]) ?? [];
}

export default async function SeriesPage({ searchParams }: { searchParams: { q?: string; status?: string; type?: string } }) {
  const series = await getSeries(searchParams);
  const q = searchParams.q || '';
  const status = searchParams.status || '';
  const type = searchParams.type || '';

  return (
    <main className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 bg-card border border-white/5 rounded-lg p-0 md:p-6 h-fit sticky top-24 z-30">
            <details className="group md:open:block open:bg-card rounded-lg md:rounded-none">
              <summary className="flex items-center justify-between p-4 md:p-0 font-bold text-white cursor-pointer md:cursor-default list-none md:border-b md:border-white/5 md:pb-2">
                <span>Filtrar</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="p-4 md:p-0 pt-0 border-t border-white/5 md:border-0">
                <form className="space-y-4 text-sm mt-4 md:mt-0">
                  <div className="space-y-2">
                    <label className="text-gray-400 font-medium">Título</label>
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Buscar título..."
                      className="w-full px-3 py-2 rounded bg-[#141414] border border-white/10 text-white placeholder:text-gray-600 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 font-medium">Estado</label>
                    <select
                      name="status"
                      defaultValue={status}
                      className="w-full px-3 py-2 rounded bg-[#141414] border border-white/10 text-white focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Todos</option>
                      <option value="ongoing">En emisión</option>
                      <option value="completed">Completo</option>
                      <option value="hiatus">Hiatus</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 font-medium">Tipo</label>
                    <select
                      name="type"
                      defaultValue={type}
                      className="w-full px-3 py-2 rounded bg-[#141414] border border-white/10 text-white focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Todos</option>
                      <option value="Manga">Manga</option>
                      <option value="Manhwa">Manhwa</option>
                      <option value="Manhua">Manhua</option>
                      <option value="Novel">Novela</option>
                      <option value="One Shot">One Shot</option>
                      <option value="Doujinshi">Doujinshi</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 rounded bg-primary text-white font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20"
                  >
                    Aplicar filtros
                  </button>
                </form>
              </div>
            </details>
          </aside>

          {/* Results */}
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between bg-card border border-white/5 p-4 rounded-lg">
              <h1 className="text-2xl font-bold text-white">Catálogo de Series</h1>
              <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                {series.length} resultados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {series.map((s) => (
                <MangaCard
                  key={s.id}
                  id={s.slug || s.id}
                  title={s.title}
                  coverUrl={s.cover_url || s.external_thumbnail || "https://placehold.co/400x600/1f1f1f/white?text=No+Cover"}
                  type={s.type || "Manga"}
                  score={undefined} // Score is not fetched here currently
                />
              ))}
              {series.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-card border border-white/5 rounded-lg">
                  <p className="text-lg">No se encontraron series con esos filtros.</p>
                  <p className="text-sm mt-2">Intenta buscar con otros términos.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
