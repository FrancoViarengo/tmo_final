"use client";

import { SORT_OPTIONS } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "latest";

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400 font-medium">Ordenar por:</label>
            <div className="relative">
                <select
                    value={currentSort}
                    onChange={handleSortChange}
                    className="appearance-none bg-[#1f1f1f] border border-white/10 text-white text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-primary cursor-pointer hover:bg-white/5 transition-colors"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
