import ListSkeleton from "@/components/skeletons/ListSkeleton";
import SectionHeader from "@/components/SectionHeader";

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#141414] pb-12">
            {/* Hero Skeleton */}
            <div className="h-[400px] w-full bg-gray-900 animate-pulse relative">
                <div className="absolute bottom-0 left-0 w-full p-8 max-w-6xl mx-auto space-y-4">
                    <div className="h-6 w-24 bg-gray-800 rounded" />
                    <div className="h-12 w-3/4 bg-gray-800 rounded" />
                    <div className="h-4 w-1/2 bg-gray-800 rounded" />
                    <div className="h-12 w-32 bg-gray-800 rounded mt-4" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 space-y-12">
                {/* Popular Skeleton */}
                <section>
                    <div className="flex items-center justify-between mb-6 pt-10">
                        <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
                    </div>
                    <ListSkeleton count={5} />
                </section>

                {/* Latest Skeleton */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
                    </div>
                    <ListSkeleton count={12} />
                </section>
            </div>
        </main>
    );
}
