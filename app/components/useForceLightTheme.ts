"use client";

import { useLayoutEffect } from "react";

export function useForceLightTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const previousColorScheme = root.style.colorScheme;

    root.classList.remove("dark");
    root.style.colorScheme = "light";

    return () => {
      root.classList.toggle("dark", hadDark);
      root.style.colorScheme = previousColorScheme;
    };
  }, []);
}
