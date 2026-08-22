"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { FloxtoWordmark } from "../components/FloxtoBrand";
import { getUserFacingError } from "../components/userFacingErrors";
import { useI18n } from "../i18n/LanguageProvider";

type ResetState = "checking" | "valid" | "invalid" | "success";

function LockIcon() {
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
      <rect height="11" rx="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [resetState, setResetState] = useState<ResetState>("checking");
  const [isLoading, setIsLoading] = useState(false);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = useMemo(
    () => passwordsMatch && password.length >= 6 && !isLoading,
    [isLoading, password.length, passwordsMatch],
  );

  useEffect(() => {
    let isMounted = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && isMounted) {
        setResetState("valid");
      }
    });

    async function establishRecoverySession() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const queryParams = new URLSearchParams(window.location.search);
      const hashError = hashParams.get("error_description");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type") ?? queryParams.get("type");
      const hasRecoveryHash =
        type === "recovery" && Boolean(accessToken) && Boolean(refreshToken);

      if (hashError) {
        if (isMounted) {
          setMessage(getUserFacingError(hashError, "auth.resetLink", t));
          setResetState("invalid");
        }
        return;
      }

      if (!hasRecoveryHash) {
        if (isMounted) {
          setResetState("invalid");
        }
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken as string,
        refresh_token: refreshToken as string,
      });

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage(getUserFacingError(error, "auth.resetLink", t));
        setResetState("invalid");
        return;
      }

      window.history.replaceState(null, "", "/reset-password");
      setResetState("valid");
    }

    establishRecoverySession();

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(getUserFacingError(error, "auth.updatePassword", t));
      setIsLoading(false);
      return;
    }

    setResetState("success");
    setIsLoading(false);
    window.setTimeout(() => router.replace("/login"), 2200);
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-[var(--c-bg)] px-6 pb-12 pt-24 text-[var(--c-text)]">
      <section className="w-full" style={{ maxWidth: "18.75rem" }}>
        <AuthBrandHeader />

        <div className="mt-9 rounded-2xl border border-[var(--c-border-strong)] bg-[var(--c-surface)] p-6 shadow-sm">
          {resetState === "checking" ? (
            <p className="py-4 text-center text-sm font-medium text-[#888888]">
              {t("common.loading")}
            </p>
          ) : null}

          {resetState === "invalid" ? (
            <div className="py-3 text-center">
              <h2 className="text-[22px] font-bold leading-tight">
                {t("auth.invalidReset")}
              </h2>
              {message ? (
                <p className="mt-2 text-sm font-medium text-[#B91C1C]">
                  {message}
                </p>
              ) : null}
              <Link
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#111111] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
                href="/forgot-password"
              >
                {t("auth.sendReset")}
              </Link>
            </div>
          ) : null}

          {resetState === "success" ? (
            <div className="py-3 text-center">
              <h2 className="text-[22px] font-bold leading-tight">
                {t("auth.passwordUpdated")}
              </h2>
              <p className="mt-2 text-sm font-medium text-[#888888]">
                {t("auth.passwordUpdatedBody")}
              </p>
              <Link
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#111111] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
                href="/login"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : null}

          {resetState === "valid" ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="text-center">
                <h2 className="text-[22px] font-bold leading-tight">
                  {t("auth.resetTitle")}
                </h2>
                <p className="mt-2 text-sm font-medium leading-5 text-[#888888]">
                  {t("auth.chooseNewPassword")}
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  {t("auth.newPassword")}
                </span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                  <LockIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder={t("auth.newPasswordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  {t("auth.confirmNewPassword")}
                </span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                  <LockIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder={t("auth.confirmNewPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
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
                {isLoading ? t("common.saving") : t("auth.resetPasswordButton")}
              </button>
            </form>
          ) : null}
        </div>
        <div className="mt-5 flex justify-center">
          <LanguageSwitcher compact />
        </div>
      </section>
    </main>
  );
}
