"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Manages session lifecycle based on "remember me" preference.
 * When ts_session_only is set in sessionStorage, the session
 * will be cleared when all tabs are closed (sessionStorage clears
 * automatically). On next visit, the user must re-login.
 */
export function SessionManager() {
  useEffect(() => {
    // On page load, check if this is a fresh browser session
    // (sessionStorage is empty = new browser session)
    const isSessionOnly = sessionStorage.getItem("ts_session_only");

    // If there's no sessionStorage marker at all, this could be
    // a new browser session after a non-remember-me login.
    // Check if we need to clear the session.
    if (isSessionOnly === null) {
      // Check if the user previously opted out of remember-me
      const wasSessionOnly = localStorage.getItem("ts_no_remember");
      if (wasSessionOnly === "true") {
        // New browser session + user didn't want to be remembered → sign out
        localStorage.removeItem("ts_no_remember");
        const supabase = createClient();
        supabase.auth.signOut();
      }
    } else if (isSessionOnly === "true") {
      // Mark in localStorage so we know to clear on next browser open
      localStorage.setItem("ts_no_remember", "true");
    }
  }, []);

  return null;
}
