"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Merchant, SubscriptionExpiredFrom } from "./productTypes";
import { buildUpgradeUrl } from "./subscription";

function StoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M4 10h16" />
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M7 10V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5" />
      <path d="M9 21v-6h6v6" />
      <path d="M4 10l1.2-4.2A2 2 0 0 1 7.1 4h9.8a2 2 0 0 1 1.9 1.8L20 10" />
    </svg>
  );
}

export function ExpiredAccessScreen({
  merchant,
}: {
  merchant: Pick<Merchant, "business_name" | "slug">;
  expiredFrom: SubscriptionExpiredFrom | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-8 py-12 text-[#111111]">
      <section className="flex min-h-[72vh] w-full max-w-sm flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F5] text-[#888888]">
          <StoreIcon />
        </div>
        <h1 className="text-[18px] font-bold leading-tight">
          Your store is temporarily offline
        </h1>
        <p className="mt-3 max-w-[18rem] text-[12px] font-medium leading-5 text-[#888888]">
          Your subscription has expired, so your storefront is currently hidden
          from customers.
        </p>
        <p className="mt-2 max-w-[18rem] text-[12px] font-medium leading-5 text-[#888888]">
          Renew your subscription to put your store back online and continue
          receiving WhatsApp orders.
        </p>
        <a
          className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-[14px] font-bold text-white transition active:scale-[0.99]"
          href={buildUpgradeUrl(merchant)}
          target="_blank"
          rel="noreferrer"
        >
          Reactivate via WhatsApp
        </a>
        <button
          className="mt-5 text-sm font-medium text-[#888888] underline-offset-4 hover:text-[#111111] hover:underline"
          type="button"
          onClick={handleLogout}
        >
          Log out? Return to Login
        </button>
      </section>
    </main>
  );
}

export function StoreUnavailableScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#111111]">
      <p className="text-lg font-semibold">
        This store is temporarily unavailable
      </p>
    </main>
  );
}
