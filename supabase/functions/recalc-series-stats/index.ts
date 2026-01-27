// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { seriesId } = await req.json().catch(() => ({ seriesId: null }));
    let query = adminClient.from("series").select("id");
    if (seriesId) query = query.eq("id", seriesId);

    const { data: seriesList, error } = await query;
    if (error) throw error;

    const results: any[] = [];
    for (const series of seriesList ?? []) {
      // count chapters
      const { data: chapters } = await adminClient
        .from("chapters")
        .select("id", { count: "exact", head: false })
        .eq("series_id", series.id)
        .eq("is_deleted", false);

      const chapterCount = chapters?.length ?? 0;

      const { error: updateError } = await adminClient
        .from("series")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", series.id);

      if (!updateError) {
        results.push({ id: series.id, chapters: chapterCount });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
