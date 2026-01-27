import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    link?: string;
    className?: string;
}

export default function SectionHeader({ title, icon, link, className = '' }: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-4 pb-2 border-b border-white/10 ${className}`}>
            <div className="flex items-center gap-2">
                {icon && <span className="text-primary">{icon}</span>}
                <h2 className="text-lg font-bold uppercase tracking-wide text-white">
                    {title}
                </h2>
            </div>
            {link && (
                <Link href={link} className="text-xs font-bold text-primary hover:text-white transition-colors uppercase">
                    Ver todo
                </Link>
            )}
        </div>
    );
}
