import { createServerClient } from '@/lib/supabase/server';

async function getSeries(searchParams: { q?: string; status?: string; type?: string }) {
  const supabase = createServerClient();
  let query = supabase
    .from('series')
    .select('id, title, cover_url, status, type, slug, updated_at')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.type) query = query.eq('type', searchParams.type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function SeriesList({ searchParams }: { searchParams: { q?: string; status?: string; type?: string } }) {
  const series = await getSeries(searchParams);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {(series as any[]).map((s) => (
        <a
          key={s.id}
          href={`/series/${s.slug || s.id}`}
          className="group rounded-lg border border-white/10 bg-white/5 shadow-sm overflow-hidden hover:shadow-lg transition"
        >
          <div className="aspect-[2/3] bg-black/40 relative">
            {s.cover_url ? (
              <img
                src={s.cover_url}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Sin portada</div>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-semibold bg-white/80 text-gray-700 uppercase">
              {s.type || 'manga'}
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-semibold bg-black/70 text-white uppercase">
              {s.status || 'ongoing'}
            </div>
          </div>
          <div className="p-3">
            <div className="font-semibold text-white line-clamp-2">{s.title}</div>
            <div className="text-xs text-gray-300 mt-1">
              Act. {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '-'}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
