"use client";

import { Languages } from "lucide-react";
import { Locale } from "../i18n/messages";
import { localeLabels, supportedLocales, useI18n } from "../i18n/LanguageProvider";

type LanguageSwitcherProps = {
  onChange?: (locale: Locale) => void | Promise<void>;
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false, onChange }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  async function handleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    await onChange?.(nextLocale);
  }

  return (
    <label
      className={`inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-full border border-[#EDECEA] bg-white text-[#1A1A18] shadow-sm ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
      }`}
    >
      <Languages aria-hidden="true" className="h-4 w-4 shrink-0 text-[#888888]" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        className="min-w-0 max-w-full flex-1 bg-transparent font-semibold outline-none"
        value={locale}
        onChange={(event) => handleChange(event.target.value as Locale)}
      >
        {supportedLocales.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {localeLabels[supportedLocale]}
          </option>
        ))}
      </select>
    </label>
  );
}
