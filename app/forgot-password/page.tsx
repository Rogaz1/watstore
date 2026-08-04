"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

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

function AppLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 9h18l-1.4-4.2A2 2 0 0 0 17.7 3H6.3a2 2 0 0 0-1.9 1.8L3 9Z" />
      <path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M8 13h8v8H8z" />
    </svg>
  );
}

function AuthBrandHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#111111] text-white shadow-sm">
        <AppLogoIcon />
      </div>
      <h1 className="mt-4 text-[24px] font-bold leading-none">Watstore</h1>
      <p className="mx-auto mt-3 max-w-full text-sm font-medium leading-5 text-[#888888]">
        Simple. Fast. Professional.
      </p>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getResetPasswordRedirectUrl() {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (configuredSiteUrl) {
    return `${configuredSiteUrl.replace(/\/$/, "")}/reset-password`;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/reset-password`;
}

export default function ForgotPasswordPage() {
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
      redirectTo: getResetPasswordRedirectUrl(),
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-6 py-8 text-[#111111]">
      <Link
        className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-[#111111] underline-offset-4 hover:underline"
        href="/login"
      >
        <ArrowLeftIcon />
        Back to login
      </Link>

      <section
        className="mx-auto mt-16 w-full"
        style={{ maxWidth: "18.75rem" }}
      >
        <AuthBrandHeader />

        <div className="mt-8 rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
          {isSent ? (
            <div className="py-3 text-center">
              <h2 className="text-[22px] font-bold leading-tight">
                Check your email
              </h2>
              <p className="mt-2 text-sm font-medium text-[#888888]">
                Check your email for a reset link.
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="text-center">
                <h2 className="text-[22px] font-bold leading-tight">
                  Reset Your Password
                </h2>
                <p className="mx-auto mt-2 text-sm font-medium leading-5 text-[#888888]">
                  Enter your email and we will send you a link to get back into
                  your account.
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  Email Address
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
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
