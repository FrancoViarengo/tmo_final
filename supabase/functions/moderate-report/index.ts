// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isAdminRole = (role: string) => role === "admin" || role === "superadmin";

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

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !isAdminRole(profile.role)) {
      throw new Error("Forbidden: Only admins");
    }

    const { reportId, action, notes } = await req.json();
    if (!reportId || !action) throw new Error("Missing reportId or action");

    let newStatus = "pending";
    if (action === "resolve" || action === "delete_content" || action === "ban_user") newStatus = "resolved";
    if (action === "dismiss") newStatus = "dismissed";

    const { error: updateError } = await adminClient
      .from("reports")
      .update({
        status: newStatus,
        resolved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (updateError) throw updateError;

    await adminClient.from("audit_logs").insert({
      admin_id: user.id,
      action: `REPORT_${action.toUpperCase()}`,
      target_table: "reports",
      target_id: reportId,
      details: { notes },
    });

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
