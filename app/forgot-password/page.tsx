"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { FloxtoWordmark } from "../components/FloxtoBrand";
import { buildAbsoluteUrl } from "../components/siteUrl";
import { getUserFacingError } from "../components/userFacingErrors";
import { useI18n } from "../i18n/LanguageProvider";

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function AuthBrandHeader() {
  const { t } = useI18n();

  return (
    <div className="text-center">
      <FloxtoWordmark />
      <p className="mx-auto mt-1.5 max-w-full text-xs font-medium leading-5 text-[var(--c-text-2)]">
        {t("app.tagline")}
      </p>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const canSubmit = isValidEmail(email) && !isLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: buildAbsoluteUrl("/reset-password"),
    });

    if (error) {
      setMessage(getUserFacingError(error, "auth.resetRequest", t));
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-[var(--c-bg)] px-6 py-8 text-[var(--c-text)]">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-[var(--c-text)] underline-offset-4 hover:underline"
          href="/login"
        >
          <ArrowLeftIcon />
          {t("auth.backToLogin")}
        </Link>
        <LanguageSwitcher compact />
      </div>

      <section
        className="mx-auto mt-14 w-full"
        style={{ maxWidth: "18.75rem" }}
      >
        <AuthBrandHeader />

        <div className="mt-9 rounded-2xl border border-[var(--c-border-strong)] bg-[var(--c-surface)] p-6 shadow-sm">
          {isSent ? (
            <div className="py-3 text-center">
              <h2 className="text-[22px] font-bold leading-tight">
                {t("auth.checkEmail")}
              </h2>
              <p className="mt-2 text-sm font-medium text-[#888888]">
                {t("auth.checkEmailBody")}
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="text-center">
                <h2 className="text-[22px] font-bold leading-tight">
                  {t("auth.resetTitle")}
                </h2>
                <p className="mx-auto mt-2 text-sm font-medium leading-5 text-[#888888]">
                  {t("auth.resetSubtitle")}
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  {t("auth.email")}
                </span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                  <EnvelopeIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="kwekumensah@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </label>

              {message ? (
                <p className="rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 py-3.5 text-sm text-[#B91C1C]">
                  {message}
                </p>
              ) : null}

              <button
                className={`w-full rounded-xl px-4 py-[15px] text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed ${
                  canSubmit
                    ? "bg-[#111111] hover:bg-[#222222]"
                    : "bg-[#111111] opacity-40"
                }`}
                type="submit"
                disabled={!canSubmit}
              >
                {isLoading ? t("common.saving") : t("auth.sendReset")}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
