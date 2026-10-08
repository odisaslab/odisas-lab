"use client";

import { openCookiePreferences } from "@/lib/consent";

export function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      Gestionar cookies
    </button>
  );
}
