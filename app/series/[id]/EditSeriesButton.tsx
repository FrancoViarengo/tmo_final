"use client";

import Link from "next/link";

export default function EditSeriesButton({ id }: { id: string }) {
    // In a real app we'd check permissions client-side or assume the parent component did.
    // For now, we'll just show it. The edit page is protected anyway.
    return (
        <Link
            href={`/series/${id}/edit`}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
        </Link>
    );
}
