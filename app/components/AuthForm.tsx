"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InstallAppPrompt } from "./InstallAppPrompt";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { FloxtoWordmark } from "./FloxtoBrand";
import { getPostAuthDestination } from "./merchantProfile";
import { buildAbsoluteUrl } from "./siteUrl";
import { getUserFacingError } from "./userFacingErrors";
import { useI18n } from "../i18n/LanguageProvider";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

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

function LoginBrandHeader() {
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

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const { data, error } = isSignup
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: buildAbsoluteUrl("/dashboard/setup"),
          },
        })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

    if (error) {
      setIsLoading(false);
      setMessage(getUserFacingError(error, isSignup ? "auth.signup" : "auth.login", t));
      return;
    }

    if (isSignup) {
      router.replace("/dashboard/setup");
      return;
    }

    try {
      const {
        data: { user },
      } = data.user
        ? { data: { user: data.user } }
        : await supabase.auth.getUser();
      const destination = await getPostAuthDestination(user);

      router.replace(destination);
    } catch (profileError) {
      setMessage(getUserFacingError(profileError, "auth.profile", t));
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-[var(--c-bg)] px-6 pb-12 pt-24 text-[var(--c-text)]">
      <section className="w-full" style={{ maxWidth: isSignup ? "20rem" : "18.75rem" }}>
        {isSignup ? (
          <LoginBrandHeader />
        ) : (
          <LoginBrandHeader />
        )}

        <div className="mt-9 rounded-2xl border border-[var(--c-border-strong)] bg-[var(--c-surface)] p-6 shadow-sm">
          {isSignup ? (
            <div className="mb-5 text-center">
              <h1 className="text-[22px] font-bold leading-tight">
                {t("auth.createAccount")}
              </h1>
              <p className="mt-2 text-sm font-medium leading-5 text-[#888888]">
                {t("auth.signupSubtitle")}
              </p>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">
                {t("auth.email")}
              </span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                {isSignup ? <EnvelopeIcon /> : null}
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                  type="email"
                  autoComplete="email"
                  placeholder="kwekumensah@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 flex min-w-0 items-center justify-between gap-3 text-xs font-semibold">
                <span className="min-w-0 flex-1 truncate">{t("auth.password")}</span>
                {!isSignup ? (
                  <Link
                    className="shrink-0 text-xs font-semibold text-[#25D366] underline-offset-4 hover:underline"
                    href="/forgot-password"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                ) : null}
              </span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                {isSignup ? <LockIcon /> : null}
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={6}
                  placeholder={
                    isSignup
                      ? t("auth.createPasswordPlaceholder")
                      : t("auth.passwordPlaceholder")
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
              className="w-full rounded-xl bg-[#111111] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? t("auth.wait")
                : isSignup
                  ? t("auth.createAccountButton")
                  : t("auth.login")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#888888]">
            {isSignup ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
            <Link
              className="font-semibold text-[#25D366] underline-offset-4 hover:underline"
              href={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? t("auth.login") : t("auth.signup")}
            </Link>
          </p>
        </div>

        <InstallAppPrompt />
        <div className="mt-5 flex justify-center">
          <LanguageSwitcher compact />
        </div>
      </section>
    </main>
  );
}
