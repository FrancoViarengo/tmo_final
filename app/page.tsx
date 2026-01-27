import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import MangaCard from '@/components/MangaCard';
import AdUnit from '@/components/AdUnit';

export const revalidate = 600;

interface Series {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  external_thumbnail?: string | null;
  description: string | null;
  score: number;
  type: 'Manga' | 'Manhwa' | 'Manhua' | 'Novel' | 'One Shot' | 'Doujinshi';
  latest_chapter?: {
    chapter_number: number;
  };
}

async function getData() {
  const supabase = createServerClient();

  // Get session for library
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  // Fetch popular series
  const { data: popular } = await supabase
    .from('series')
    .select('*')
    .eq('is_deleted', false)
    .order('score', { ascending: false })
    .limit(5);

  // Fetch latest updates
  const { data: latest } = await supabase
    .from('chapters')
    .select('*, series(*)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(12);

  // Fetch user library if logged in
  let library: Series[] = [];
  if (userId) {
    const { data: bookmarks } = await supabase
      .from('library')
      .select('*, series(*)')
      .eq('user_id', userId)
      .limit(6);
    library = bookmarks?.map((b: any) => b.series) || [];
  }

  // Group chapters by series for "Latest Updates"
  const latestSeriesMap = new Map<string, any>();
  latest?.forEach((ch: any) => {
    if (!ch.series) return;
    if (!latestSeriesMap.has(ch.series.id)) {
      latestSeriesMap.set(ch.series.id, { ...ch.series, latest_chapter: ch });
    }
  });
  const latestSeries = Array.from(latestSeriesMap.values()).slice(0, 6);

  return {
    popular: (popular as Series[]) || [],
    latest: (latestSeries as Series[]),
    library: (library as Series[])
  };
}

export default async function Home() {
  const { popular, latest, library } = await getData();

  // Fallback data if DB is empty
  const heroSeries = popular[0] || {
    id: 'demo',
    title: 'Solo Leveling',
    description: 'En un mundo donde cazadores con habilidades mágicas deben luchar contra monstruos para proteger a la raza humana de la aniquilación, un cazador débil llamado Sung Jinwoo se encuentra en una lucha por la supervivencia.',
    cover_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
    slug: 'solo-leveling'
  };

  return (
    <main className="min-h-screen bg-[#141414] pb-12">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60 z-10" />
        <img
          src={heroSeries.cover_url || heroSeries.external_thumbnail || '/placeholder.jpg'}
          alt={heroSeries.title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 z-20 max-w-6xl mx-auto">
          <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded uppercase mb-3 inline-block">
            Destacado
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg max-w-3xl leading-tight">
            {heroSeries.title}
          </h1>
          <p className="text-gray-200 line-clamp-2 max-w-2xl mb-6 text-lg drop-shadow-md">
            {heroSeries.description}
          </p>
          <div className="flex gap-4">
            <Link
              href={`/series/${heroSeries.slug || heroSeries.id}`}
              className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-lg transition shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Leer Ahora
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 space-y-12">
        {/* Popular Updates */}
        <section>
          <SectionHeader
            title="Populares"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            link="/series?sort=popular"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popular.length > 0 ? popular.map((series) => (
              <MangaCard
                key={series.id}
                id={series.id}
                title={series.title}
                coverUrl={series.cover_url || series.external_thumbnail || '/placeholder.jpg'}
                type={series.type}
                score={series.score}
              />
            )) : (
              // Empty state placeholders
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse flex items-center justify-center text-white/20">
                  Sin datos
                </div>
              ))
            )}
          </div>
        </section>

        {/* Ad Placement */}
        <section className="max-w-4xl mx-auto">
          <AdUnit slot="header" className="rounded-lg shadow-lg" />
        </section>

        {/* Latest Updates */}
        <section>
          <SectionHeader
            title="Recientes"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            link="/series?sort=latest"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latest.length > 0 ? latest.map((series: any) => (
              <MangaCard
                key={series.id}
                id={series.id}
                title={series.title}
                coverUrl={series.cover_url || series.external_thumbnail || '/placeholder.jpg'}
                type={series.type}
                score={series.score}
              // badge is not supported by MangaCard yet, avoiding for now or we need to add it to MangaCard
              />
            )) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No hay actualizaciones recientes.
              </div>
            )}
          </div>
        </section>

        {/* My Library Section */}
        {library.length > 0 && (
          <section>
            <SectionHeader
              title="Mi Biblioteca"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
              link="/library"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {library.map((series: any) => (
                <MangaCard
                  key={series.id}
                  id={series.id}
                  title={series.title}
                  coverUrl={series.cover_url || '/placeholder.jpg'}
                  type={series.type}
                  score={series.score}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
