"use client";

import { SERIES_TYPES, SERIES_STATUS, DEMOGRAPHICS, GENRES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filters
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Initialize from URL
    useEffect(() => {
        const types = searchParams.get("types")?.split(",") || [];
        const status = searchParams.get("status")?.split(",") || [];
        const demographics = searchParams.get("demographics")?.split(",") || [];
        const genres = searchParams.get("genres")?.split(",") || [];

        setSelectedTypes(types);
        setSelectedStatus(status);
        setSelectedDemographics(demographics);
        setSelectedGenres(genres);
    }, [searchParams]);

    const updateFilters = (key: string, values: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (values.length > 0) {
            params.set(key, values.join(","));
        } else {
            params.delete(key);
        }
        // Content layout shift prevention: maybe replace instead of push?
        // Using push to allow back button navigation history
        router.push(`/search?${params.toString()}`);
    };

    const toggleFilter = (
        currentValues: string[],
        setValues: (vals: string[]) => void,
        key: string,
        value: string
    ) => {
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];

        setValues(newValues);
        updateFilters(key, newValues);
    };

    const clearFilters = () => {
        router.push("/search");
    };

    return (
        <div className="bg-card border border-white/5 rounded-xl p-6 space-y-8 sticky top-24">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filtros
                </h2>
                <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Limpiar
                </button>
            </div>

            {/* Tipo */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-300 text-sm uppercase">Tipo</h3>
                <div className="flex flex-wrap gap-2">
                    {SERIES_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => toggleFilter(selectedTypes, setSelectedTypes, "types", type)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTypes.includes(type)
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Estado */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-300 text-sm uppercase">Estado</h3>
                <div className="flex flex-wrap gap-2">
                    {SERIES_STATUS.map((status) => (
                        <button
                            key={status.value}
                            onClick={() => toggleFilter(selectedStatus, setSelectedStatus, "status", status.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedStatus.includes(status.value)
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Demografía */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-300 text-sm uppercase">Demografía</h3>
                <div className="flex flex-wrap gap-2">
                    {DEMOGRAPHICS.map((demo) => (
                        <button
                            key={demo}
                            onClick={() => toggleFilter(selectedDemographics, setSelectedDemographics, "demographics", demo)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDemographics.includes(demo)
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {demo}
                        </button>
                    ))}
                </div>
            </div>

            {/* Géneros */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-300 text-sm uppercase">Géneros</h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => toggleFilter(selectedGenres, setSelectedGenres, "genres", genre)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedGenres.includes(genre)
                                    ? "bg-primary border-primary text-white"
                                    : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                                }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
