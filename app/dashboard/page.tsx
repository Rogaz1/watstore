"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setIsCheckingAuth(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 text-[#1f2933]">
        <p className="text-sm font-medium text-[#52606d]">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#1f2933]">
      <header className="border-b border-[#d8d2c4] bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5d6b5c]">
              Watstore
            </p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <button
            className="rounded-md border border-[#c3bbab] px-4 py-2 text-sm font-medium transition hover:border-[#2f6f6c] hover:text-[#2f6f6c]"
            type="button"
            onClick={handleSignOut}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-lg border border-[#d8d2c4] bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-medium text-[#52606d]">
            Signed in as
          </p>
          <p className="text-lg font-semibold">{user?.email}</p>
          <div className="mt-8 border-t border-[#e2ded6] pt-8">
            <h2 className="text-xl font-semibold">Merchant workspace</h2>
            <p className="mt-2 max-w-2xl text-[#52606d]">
              Your dashboard is ready. Product management, storefront, and
              ordering can be added after the auth and data boundaries are in
              place.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
