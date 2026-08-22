"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  Locale,
  localeLabels,
  messages,
  supportedLocales,
} from "./messages";

const LOCALE_STORAGE_KEY = "floxto-locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  setMerchantLocale: (locale: Locale | null | undefined) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr";
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  if (isLocale(saved)) {
    return saved;
  }

  const browserLocale = window.navigator.language.toLowerCase();

  if (browserLocale.startsWith("fr")) {
    return "fr";
  }

  return defaultLocale;
}

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
  }, []);

  const setMerchantLocale = useCallback((merchantLocale: Locale | null | undefined) => {
    if (!merchantLocale || merchantLocale === locale) {
      return;
    }

    setLocaleState(merchantLocale);
    persistLocale(merchantLocale);
  }, [locale]);

  const t = useCallback(
    (key: string, replacements: Record<string, string | number> = {}) => {
      const template = messages[locale][key] ?? messages[defaultLocale][key] ?? key;

      return Object.entries(replacements).reduce(
        (value, [name, replacement]) =>
          value.replaceAll(`{${name}}`, String(replacement)),
        template,
      );
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, setMerchantLocale, t }),
    [locale, setLocale, setMerchantLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }

  return value;
}

export { localeLabels, supportedLocales };
