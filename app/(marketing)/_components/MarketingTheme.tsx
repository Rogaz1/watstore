"use client";

import { useLayoutEffect } from "react";

const THEME_STORAGE_KEY = "floxto-theme";

/**
 * The public website is always light. A merchant's dark preference is
 * restored when they move on to the app screens.
 */
export function MarketingTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";

    return () => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      } catch {}
      const theme = stored === "dark" ? "dark" : "light";
      root.classList.toggle("dark", theme === "dark");
      root.style.colorScheme = theme;
    };
  }, []);

  return null;
}
