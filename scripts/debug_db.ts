import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    let logBuffer = "--- DEBUG REPORT ---\n";
    const log = (msg: string) => { console.log(msg); logBuffer += msg + "\n"; };

    log("\n[JJK DEBUG]");

    // Find JJK
    const { data: jjkSeries } = await adminClient.from('series').select('id, slug, title').ilike('title', '%Jujutsu%').single();

    if (!jjkSeries) {
        log("JJK Series not found in DB.");
    } else {
        log(`Found Series: ${jjkSeries.title} (${jjkSeries.slug})`);

        // Get latest chapter
        const { data: chapter } = await adminClient
            .from('chapters')
            .select('id, chapter_number, source, external_id')
            .eq('series_id', jjkSeries.id)
            .order('chapter_number', { ascending: false })
            .limit(1)
            .single();

        if (!chapter) {
            log("No chapters found for JJK.");
        } else {
            log(`Testing Chapter ${chapter.chapter_number}`);
            log(`Source: ${chapter.source}`);
            log(`External ID: ${chapter.external_id}`);

            if (chapter.source === 'mangadex' && chapter.external_id) {
                const mdUrl = `https://api.mangadex.org/at-home/server/${chapter.external_id}`;
                log(`Fetching MD: ${mdUrl}`);
                try {
                    const res = await fetch(mdUrl);
                    log(`Response Status: ${res.status} ${res.statusText}`);

                    if (!res.ok) {
                        const txt = await res.text();
                        log(`Error Body: ${txt}`);
                    } else {
                        const json = await res.json();
                        log(`BaseURL: ${json.baseUrl}`);
                        if (json.chapter && json.chapter.data) {
                            log(`Files found: ${json.chapter.data.length}`);
                            if (json.chapter.data.length === 0) {
                                log("WARNING: 0 files found. Dumping full JSON:");
                                log(JSON.stringify(json, null, 2));
                            }
                        } else {
                            log("No files in response structure.");
                            log(JSON.stringify(json, null, 2));
                        }
                    }
                } catch (e: any) {
                    log(`Fetch Failed: ${e.message}`);
                }
            } else {
                log("Chapter is not tagged as mangadex source.");
            }
        }
    }

    fs.writeFileSync('debug_log.txt', logBuffer);
}

run();
