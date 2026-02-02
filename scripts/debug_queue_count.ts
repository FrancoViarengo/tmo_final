
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("URL:", supabaseUrl);
console.log("Key Length:", supabaseKey?.length);

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        headers: {
            Authorization: `Bearer ${supabaseKey}`
        }
    }
});

async function main() {
    console.log("checking count...");
    const { count, error } = await supabaseAdmin
        .from('sync_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    console.log("Count:", count);
    console.log("Error:", error);

    console.log("checking data...");
    const { data } = await supabaseAdmin
        .from('sync_queue')
        .select('id, status')
        .limit(5);
    console.log("Data Sample:", data);
}

main();
