"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "floxto-theme";
type ThemePreference = "light" | "dark";

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : "light";
}

function applyTheme(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-pressed={isDark}
      className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-[#EDECEA] bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
      type="button"
      onClick={handleToggle}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0] text-[#1A1A18]">
          {isDark ? (
            <Moon aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Sun aria-hidden="true" className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-[#1A1A18]">
            Dark Mode
          </span>
          <span className="mt-1 block text-xs font-medium text-[#888888]">
            Darker interface in low light.
          </span>
        </span>
      </span>
      <span
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
          isDark ? "bg-[#25D366]" : "bg-[#E5E5E5]"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
