export default function MangaCardSkeleton() {
    return (
        <div className="relative aspect-[3/4] bg-white/5 rounded-xl overflow-hidden border border-white/5 animate-pulse">
            {/* Image Skeleton */}
            <div className="absolute inset-0 bg-gray-800" />

            {/* Content Overlay Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-10">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-700 rounded w-12" />
                    <div className="h-4 w-8 bg-gray-700 rounded-full" />
                </div>
            </div>
        </div>
    );
}
