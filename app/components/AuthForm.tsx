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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 py-12 text-[#1f2933]">
      <section className="w-full max-w-md rounded-lg border border-[#d8d2c4] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#5d6b5c]">
            Watstore
          </p>
          <h1 className="text-3xl font-semibold">
            {isSignup ? "Create your merchant account" : "Log in to Watstore"}
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Password</span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message ? (
            <p className="rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
              {message}
            </p>
          ) : null}

          <button
            className="h-12 w-full rounded-md bg-[#2f6f6c] px-4 font-medium text-white transition hover:bg-[#285f5c] disabled:cursor-not-allowed disabled:bg-[#9fb9b7]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#52606d]">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            className="font-medium text-[#2f6f6c] underline-offset-4 hover:underline"
            href={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </section>
    </main>
  );
}
