"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Merchant, SubscriptionExpiredFrom } from "./productTypes";
import { buildUpgradeUrl } from "./subscription";

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
          <LockIcon />
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
