"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1C1917] text-white shadow-sm">
        <AppLogoIcon />
      </div>
      <h1 className="mt-4 text-[24px] font-bold leading-none">Watstore</h1>
      <p className="mx-auto mt-3 max-w-full text-sm font-medium leading-5 text-[#78716C]">
        Your WhatsApp store, beautifully managed.
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          setMessage(hashError);
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
        setMessage(error.message);
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
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setResetState("success");
    setIsLoading(false);
    window.setTimeout(() => router.replace("/login"), 2200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 py-12 text-[#1C1917]">
      <section className="w-full" style={{ maxWidth: "18.75rem" }}>
        <AuthBrandHeader />

        <div className="mt-8 rounded-xl border border-[#E7E4DF] bg-white p-6 shadow-sm">
          {resetState === "checking" ? (
            <p className="py-4 text-center text-sm font-medium text-[#78716C]">
              Checking reset link...
            </p>
          ) : null}

          {resetState === "invalid" ? (
            <div className="py-3 text-center">
              <h2 className="text-lg font-bold">
                This password reset link is invalid or has expired
              </h2>
              {message ? (
                <p className="mt-2 text-sm font-medium text-[#B94A2C]">
                  {message}
                </p>
              ) : null}
              <Link
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] transition hover:opacity-95"
                href="/forgot-password"
              >
                Request a new link
              </Link>
            </div>
          ) : null}

          {resetState === "success" ? (
            <div className="py-3 text-center">
              <h2 className="text-lg font-bold">Password updated</h2>
              <p className="mt-2 text-sm font-medium text-[#78716C]">
                Your password has been reset. Redirecting you to login...
              </p>
              <Link
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] transition hover:opacity-95"
                href="/login"
              >
                Continue to login
              </Link>
            </div>
          ) : null}

          {resetState === "valid" ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="text-center">
                <h2 className="text-[18px] font-bold leading-tight">
                  Reset your password
                </h2>
                <p className="mt-2 text-xs font-medium leading-5 text-[#78716C]">
                  Choose a new password for your account.
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  New Password
                </span>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-3 text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                  <LockIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-[#1C1917] outline-none placeholder:text-[#78716C]"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Confirm New Password
                </span>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-3 text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                  <LockIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-[#1C1917] outline-none placeholder:text-[#78716C]"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </label>

              {message ? (
                <p className="rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
                  {message}
                </p>
              ) : null}

              <button
                className={`h-12 w-full rounded-full px-4 font-bold text-white transition disabled:cursor-not-allowed ${
                  canSubmit
                    ? "bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] hover:opacity-95"
                    : "bg-[#78716C] opacity-55"
                }`}
                type="submit"
                disabled={!canSubmit}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}
