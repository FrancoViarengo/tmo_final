// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requireRole = (role: string) => ["uploader", "editor", "admin", "superadmin"].includes(role);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const adminClient = createClient(supabaseUrl, serviceKey);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // validate role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !requireRole(profile.role)) {
      throw new Error("Forbidden");
    }

    const { series_id, chapter_metadata, pages } = await req.json();
    if (!series_id || !pages || pages.length === 0) throw new Error("Missing series_id or pages");

    const { volume_number, number, title, group_id } = chapter_metadata || {};

    // create chapter
    const { data: chapter, error: chapterError } = await adminClient
      .from("chapters")
      .insert({
        series_id,
        uploader_id: user.id,
        volume_number,
        chapter_number: number,
        title,
        group_id: group_id || null,
      })
      .select()
      .single();
    if (chapterError || !chapter) throw new Error(`Chapter creation failed: ${chapterError?.message}`);

    // bulk pages
    const pagesData = pages.map((p: any, idx: number) => ({
      chapter_id: chapter.id,
      page_number: idx + 1,
      image_url: p.url || p.image_url,
      width: p.width || 0,
      height: p.height || 0,
      size_kb: p.size_kb || 0,
    }));

    const { error: pagesError } = await adminClient.from("pages").insert(pagesData);
    if (pagesError) {
      await adminClient.from("chapters").delete().eq("id", chapter.id);
      throw new Error(`Pages insertion failed: ${pagesError.message}`);
    }

    // register upload
    await adminClient.from("uploads").insert({
      uploader_id: user.id,
      series_id,
      chapter_id: chapter.id,
      bucket: "pages",
      path: `chapter/${chapter.id}`,
      status: "processed",
      file_type: "bulk/pages",
    });

    await adminClient.from("series").update({ updated_at: new Date().toISOString() }).eq("id", series_id);

    return new Response(JSON.stringify({ success: true, chapterId: chapter.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
