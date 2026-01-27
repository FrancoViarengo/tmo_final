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
            const LAST_SYNC_KEY = "neosync_last_internal_tick";
            const COOLDOWN = 1000 * 60 * 30; // 30 minutes

            const lastSync = localStorage.getItem(LAST_SYNC_KEY);
            const now = Date.now();

            if (!lastSync || now - parseInt(lastSync) > COOLDOWN) {
                try {
                    // We call the 'tick' endpoint which doesn't require Vercel Cron secrets
                    // but does require the user to be logged in as Admin (which we just forced)
                    await fetch("/api/admin/neosync/tick", { method: "POST" });
                    localStorage.setItem(LAST_SYNC_KEY, now.toString());
                    console.log("NeoSync: Autonomous cycle triggered.");
                } catch (e) {
                    // Fail silently in background
                }
            }
        };

        triggerSync();
    }, []);

    return null; // Invisible component
}
