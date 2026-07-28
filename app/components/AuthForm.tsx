"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPostAuthDestination } from "./merchantProfile";

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

function LoginBrandHeader() {
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

export function AuthForm({ mode }: AuthFormProps) {
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

    const credentials = {
      email: email.trim(),
      password,
    };

    const { data, error } = isSignup
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      setIsLoading(false);
      setMessage(error.message);
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
      setMessage(
        profileError instanceof Error
          ? profileError.message
          : "Unable to check your store setup.",
      );
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 py-12 text-[#1C1917]">
      <section className="w-full" style={{ maxWidth: isSignup ? "20rem" : "18.75rem" }}>
        {isSignup ? (
          <LoginBrandHeader />
        ) : (
          <LoginBrandHeader />
        )}

        <div className={`${isSignup ? "mt-5" : "mt-8"} rounded-xl border border-[#E7E4DF] bg-white p-6 shadow-sm`}>
          {isSignup ? (
            <div className="mb-5 text-center">
              <h1 className="text-[18px] font-bold leading-tight">
                Create an account
              </h1>
              <p className="mt-2 text-xs font-medium text-[#78716C]">
                Enter your details to set up your store
              </p>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Email Address
              </span>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-3 text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                {isSignup ? <EnvelopeIcon /> : null}
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-[#1C1917] outline-none placeholder:text-[#78716C]"
                  type="email"
                  autoComplete="email"
                  placeholder="name@business.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm font-semibold">
                <span className="min-w-0 flex-1 truncate">Password</span>
                {!isSignup ? (
                  <Link
                    className="shrink-0 text-xs font-semibold text-[#1DA851] underline-offset-4 hover:underline"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                ) : null}
              </span>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-3 text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                {isSignup ? <LockIcon /> : null}
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-[#1C1917] outline-none placeholder:text-[#78716C]"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={6}
                  placeholder={
                    isSignup
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
              className="h-12 w-full rounded-full bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#78716C]">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              className="font-semibold text-[#1DA851] underline-offset-4 hover:underline"
              href={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
