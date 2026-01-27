import { createServerClient } from "@/lib/supabase/server";
import FilterSidebar from "@/components/search/FilterSidebar";
import SortDropdown from "@/components/search/SortDropdown";
import MangaCard from "@/components/MangaCard"; // Ensuring default import based on typical pattern, will verify

interface SearchParams {
  q?: string;
  types?: string;
  status?: string;
  genres?: string;
  demographics?: string;
  sort?: string;
  page?: string;
}

export const metadata = {
  title: "Búsqueda Avanzada | TMO Clone",
  description: "Encuentra tus mangas favoritos por género, estado y más.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createServerClient();
  const query = searchParams.q || "";
  const types = searchParams.types?.split(",") || [];
  const status = searchParams.status?.split(",") || [];
  const genres = searchParams.genres?.split(",") || [];
  const demographics = searchParams.demographics?.split(",") || [];
  const sort = searchParams.sort || "latest";

  // Build Query
  let dbQuery = supabase.from("series").select("*");

  // Text Search
  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  // Filters
  if (types.length > 0) {
    dbQuery = dbQuery.in("type", types);
  }

  if (status.length > 0) {
    dbQuery = dbQuery.in("status", status);
  }

  // For tags/genres (assuming 'tags' column exists as array)
  // Converting genres and demographics into a single tags check if they are stored together
  // Or handle separately if schema differs. Based on earlier observation, 'tags' seems to hold genres.
  const allTags = [...genres, ...demographics];
  if (allTags.length > 0) {
    dbQuery = dbQuery.contains("tags", allTags);
  }

  // Sorting
  switch (sort) {
    case "oldest":
      dbQuery = dbQuery.order("created_at", { ascending: true });
      break;
    case "alphabetical_asc":
      dbQuery = dbQuery.order("title", { ascending: true });
      break;
    case "alphabetical_desc":
      dbQuery = dbQuery.order("title", { ascending: false });
      break;
    case "latest":
    default:
      dbQuery = dbQuery.order("created_at", { ascending: false });
      break;
  }

  // Execute
  const { data: results, error } = await dbQuery;

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar - Desktop */}
          <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Explorar</h1>
                <p className="text-gray-400 text-sm">
                  {results ? `${results.length} resultados` : "Buscando..."}
                </p>
              </div>
              <SortDropdown />
            </div>

            {/* Mobile Filter Toggle (You might want a modal here later) */}
            <div className="md:hidden mb-4">
              <details className="group">
                <summary className="list-none btn btn-secondary w-full flex justify-between items-center cursor-pointer bg-card p-3 rounded-lg border border-white/10">
                  <span className="font-semibold text-white">Filtros</span>
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </summary>
                <div className="mt-2">
                  <FilterSidebar />
                </div>
              </details>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results && results.map((series: any) => (
                <MangaCard
                  key={series.id}
                  id={series.id}
                  title={series.title}
                  coverUrl={series.cover_url}
                  type={series.type}
                // We don't have score or demography in core table yet, passing undefined or mocks if needed
                // If demography is in tags, we could extract it, but for now leave empty
                />
              ))}

              {(!results || results.length === 0) && (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-400">Intenta ajustar los filtros o buscar con otro término.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
