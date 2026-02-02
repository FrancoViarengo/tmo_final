import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Load envs manually for the script context
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import fs from 'fs';

function log(msg: string) {
    fs.appendFileSync('debug_script.log', msg + '\n');
    console.log(msg);
}

async function testDiscovery() {
    log("1. Checking Queue...");
    const { count, error } = await supabase.from('sync_queue').select('*', { count: 'exact', head: true });

    if (error) {
        log("DB Error: " + error.message);
        return;
    }
    log(`Queue Size: ${count}`);

    // Always try to fetch if count is low OR if we want to force test
    if ((count || 0) < 50) {
        log("2. Fetching from MangaDex...");
        try {
            const res = await fetch('https://api.mangadex.org/manga?limit=5&availableTranslatedLanguage[]=es&order[followedCount]=desc');
            const json = await res.json();
            log(`MangaDex returned ${json.data?.length} series.`);

            if (json.data && json.data.length > 0) {
                const seeds = json.data.map((m: any) => ({
                    external_id: m.id,
                    type: 'series',
                    priority: 5,
                    metadata: { title: m.attributes.title.en || Object.values(m.attributes.title)[0] }
                }));
                log("3. Inserting to DB..."); // Log one item
                const { error: insertErr } = await supabase.from('sync_queue').upsert(seeds, { onConflict: 'external_id, type', ignoreDuplicates: true });
                if (insertErr) log("Insert Error: " + insertErr.message);
                else log("Success! Added series to queue.");
            }

        } catch (e: any) {
            log("Fetch Error: " + e.message);
        }
    } else {
        log("Queue is full, logic would pause here.");
    }
}

testDiscovery();
