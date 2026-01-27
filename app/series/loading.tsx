import ListSkeleton from "@/components/skeletons/ListSkeleton";

export default function Loading() {
    return (
        <main className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar Skeleton */}
                    <aside className="w-full md:w-64 bg-card border border-white/5 rounded-lg p-6 space-y-6 h-fit">
                        <div className="h-6 w-24 bg-gray-800 rounded animate-pulse mb-6" />
                        <div className="space-y-4">
                            <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
                            <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
                            <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
                        </div>
                    </aside>

                    {/* Results Skeleton */}
                    <section className="flex-1 space-y-6">
                        <div className="flex items-center justify-between bg-card border border-white/5 p-4 rounded-lg">
                            <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
                        </div>

                        <ListSkeleton count={8} />
                    </section>
                </div>
            </div>
        </main>
    );
}
