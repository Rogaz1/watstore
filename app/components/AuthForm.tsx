"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InstallAppPrompt } from "./InstallAppPrompt";
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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#111111] text-white shadow-sm">
        <AppLogoIcon />
      </div>
      <p className="mx-auto mt-4 max-w-full text-sm font-medium leading-5 text-[#888888]">
        Simple. Fast. Professional.
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
    <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 py-12 text-[#111111]">
      <section className="w-full" style={{ maxWidth: isSignup ? "20rem" : "18.75rem" }}>
        {isSignup ? (
          <LoginBrandHeader />
        ) : (
          <LoginBrandHeader />
        )}

        <div className={`${isSignup ? "mt-5" : "mt-8"} rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm`}>
          {isSignup ? (
            <div className="mb-5 text-center">
              <h1 className="text-[22px] font-bold leading-tight">
                Create an account
              </h1>
              <p className="mt-2 text-sm font-medium leading-5 text-[#888888]">
                Enter your details to set up your store
              </p>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">
                Email Address
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
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
                {isSignup ? <LockIcon /> : null}
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
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
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#888888]">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              className="font-semibold text-[#1DA851] underline-offset-4 hover:underline"
              href={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>

        <InstallAppPrompt />
      </section>
    </main>
  );
}
