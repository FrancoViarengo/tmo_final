import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import { GET as runWorker } from '@/app/api/cron/daily-import/route';

export async function POST() {
    try {
        await requireAdmin();

        // Direct Function Call (Bypasses Network/Port issues)
        const fakeReq = new Request('http://localhost/api/cron/daily-import', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`
            }
        });

        console.log("Tick: Invoking Worker directly...");
        const res = await runWorker(fakeReq);

        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = { error: "Failed to parse worker response" };
        }

        console.log("Tick: Worker result:", data);

        return NextResponse.json({
            success: true,
            message: "Ciclo ejecutado exitosamente (Direct Invocation).",
            details: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
