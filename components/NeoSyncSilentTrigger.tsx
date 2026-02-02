"use client";

import { useEffect } from "react";

/**
 * NeoSyncSilentTrigger: 
 * Ensures the automation worker is pinged silently in the background.
 * Uses a local storage cooldown to avoid flooding the API.
 */
export default function NeoSyncSilentTrigger() {
    useEffect(() => {
        const triggerSync = async () => {
            const LAST_SYNC_KEY = "neosync_last_internal_tick_v2"; // RESET CACHE
            const COOLDOWN = 1000 * 60 * 1; // 1 minute (Turbo Mode)

            const lastSync = localStorage.getItem(LAST_SYNC_KEY);
            const now = Date.now();
            const elapsed = lastSync ? now - parseInt(lastSync) : Infinity;

            if (elapsed > COOLDOWN) {
                try {
                    console.log("NeoSync: 🟢 Triggering Sync Cycle...");
                    // We call the 'tick' endpoint which doesn't require Vercel Cron secrets
                    // but does require the user to be logged in as Admin (which we just forced)
                    await fetch("/api/admin/neosync/tick", { method: "POST" });
                    localStorage.setItem(LAST_SYNC_KEY, now.toString());
                    console.log("NeoSync: ✅ Cycle executed. Sleeping for 1 min.");
                } catch (e) {
                    console.error("NeoSync: 🔴 Trigger failed", e);
                }
            } else {
                console.log(`NeoSync: ⏳ Waiting... (${Math.round((COOLDOWN - elapsed) / 1000)}s left)`);
            }
        };

        // Initial check
        triggerSync();

        // Loop check every 30 seconds
        const interval = setInterval(triggerSync, 30000);
        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}
