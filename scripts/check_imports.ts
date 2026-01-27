import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env checks
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImports() {
    console.log("Checking last 10 series...");

    // Check Series fetched by creation time (assuming Supabase auto-generates created_at if not provided, or we check updated_at)
    // The import script sets updated_at explicitly.
    const { data: series, error } = await supabase
        .from('series')
        .select('id, title, slug, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching series:", error);
    } else {
        console.table(series);
    }

    console.log("\nChecking last 10 chapters...");
    const { data: chapters, error: chError } = await supabase
        .from('chapters')
        .select('id, title, chapter_number, created_at, series:series(title)')
        // We order by system Insert/Update time? 
        // No, we inserted with explicit created_at from MangaDex.
        // So we can't easily check "what was just inserted" unless we rely on IDs or if we assume they are 'new' in terms of ID generation (UUID v7 is time sorted, v4 is not).
        // But we can check counts.
        .limit(10);

    // Let's count total series
    const { count: seriesCount } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Series in DB: ${seriesCount}`);
}

checkImports();
