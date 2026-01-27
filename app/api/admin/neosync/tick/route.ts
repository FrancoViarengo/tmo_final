import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function POST() {
    try {
        await requireAdmin();

        // Trigger the daily-import logic by calling it internally with the secret
        // Path matches the Vercel Cron path
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4001';
        const res = await fetch(`${baseUrl}/api/cron/daily-import`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`
            }
        });

        const data = await res.json();

        return NextResponse.json({
            success: true,
            message: "Ciclo de NeoSync ejecutado manualmente.",
            details: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
