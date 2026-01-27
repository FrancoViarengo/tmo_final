import MangaCardSkeleton from "./MangaCardSkeleton";

export default function ListSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <MangaCardSkeleton key={i} />
            ))}
        </div>
    );
}
