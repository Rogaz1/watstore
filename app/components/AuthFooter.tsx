"use client";

import Link from "next/link";
import { buildWhatsAppUrl } from "./publicStoreTypes";
import { PLATFORM_WHATSAPP_NUMBER } from "./subscription";
import { useI18n } from "../i18n/LanguageProvider";

const LINK_CLASS =
  "inline-flex min-h-11 items-center px-3 text-xs font-medium text-[var(--c-text-2)] underline-offset-4 transition hover:text-[var(--c-text)] hover:underline";

/** Quiet sign-off under the auth cards: support, legal links and copyright. */
export function AuthFooter() {
  const { locale, t } = useI18n();
  const supportMessage =
    locale === "fr" ? "Bonjour, j'ai une question." : "Hello Floxto, I have a question.";

  return (
    <footer className="mt-8 border-t border-[var(--c-border-strong)] pt-3 text-center">
      <nav aria-label="Floxto" className="flex flex-wrap items-center justify-center">
        <a
          className={LINK_CLASS}
          href={buildWhatsAppUrl(PLATFORM_WHATSAPP_NUMBER, supportMessage)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("auth.footerContact")}
        </a>
        <Link className={LINK_CLASS} href="/terms">
          {t("auth.agreeTerms")}
        </Link>
        <Link className={LINK_CLASS} href="/privacy">
          {t("auth.agreePrivacy")}
        </Link>
      </nav>
      <p className="mt-1 text-xs text-[var(--c-text-3)]">
        &copy; {new Date().getFullYear()} Floxto
      </p>
    </footer>
  );
}
