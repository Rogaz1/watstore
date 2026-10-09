"use client";

import Link from "next/link";
import { FloxtoWordmark } from "./FloxtoBrand";
import { useI18n } from "../i18n/LanguageProvider";

/** Logo and tagline above the auth cards. The logo links back to the homepage. */
export function AuthBrandHeader() {
  const { t } = useI18n();

  return (
    <div className="text-center">
      <Link aria-label="Floxto home" className="block" href="/">
        <FloxtoWordmark />
      </Link>
      <p className="mx-auto mt-1.5 max-w-full text-xs font-medium leading-5 text-[var(--c-text-2)]">
        {t("app.tagline")}
      </p>
    </div>
  );
}
