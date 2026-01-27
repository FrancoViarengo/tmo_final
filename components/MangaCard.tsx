import Link from 'next/link';

interface MangaCardProps {
    id: string | number;
    title: string;
    coverUrl: string;
    type: 'Manga' | 'Manhwa' | 'Manhua' | 'Novel' | 'One Shot' | 'Doujinshi';
    score?: number;
    demography?: string;
}

export default function MangaCard({ id, title, coverUrl, type, score, demography }: MangaCardProps) {
    const typeColors = {
        Manga: 'bg-blue-600',
        Manhwa: 'bg-red-600',
        Manhua: 'bg-green-600',
        Novel: 'bg-yellow-600',
        'One Shot': 'bg-purple-600',
        Doujinshi: 'bg-pink-600',
    };

    const badgeColor = typeColors[type] || 'bg-gray-600';

    // Helper for Supabase Image Optimization
    const getOptimizedUrl = (url: string) => {
        if (!url || !url.includes('supabase.co')) return url;
        // If already has params, assume it's handled or append elegantly. simple append for now.
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=400&resize=contain&quality=80`;
    };

    const optimizedCover = getOptimizedUrl(coverUrl);

    return (
        <Link href={`/series/${id}`} className="group relative block aspect-[2/3] overflow-hidden rounded-md bg-card shadow-sm hover:shadow-md transition-all">
            <img
                src={optimizedCover}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                width={400}
                height={600}
            />

            {/* Type Badge */}
            <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase text-white rounded shadow-sm ${badgeColor}`}>
                {type}
            </span>

            {/* Score Badge */}
            {score && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-8 h-6 bg-black/80 text-white text-xs font-bold rounded-full border border-white/20">
                    {score}
                </span>
            )}

            {/* Demography Badge (if exists) */}
            {demography && (
                <span className="absolute bottom-20 left-2 px-2 py-0.5 text-[10px] uppercase text-white bg-black/60 rounded backdrop-blur-sm">
                    {demography}
                </span>
            )}

            {/* Title Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
