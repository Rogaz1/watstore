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
  expiredFrom,
}: {
  merchant: Pick<Merchant, "business_name" | "slug">;
  expiredFrom: SubscriptionExpiredFrom | null;
}) {
  const router = useRouter();
  const wasTrial = expiredFrom !== "active";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-7 py-12 text-[#111111]">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F4F5] text-[#888888]">
          <LockIcon />
        </div>
        <h1 className="text-[22px] font-bold leading-tight">
          {wasTrial
            ? "Your free trial has ended"
            : "Your subscription has ended"}
        </h1>
        <div className="mt-5 flex flex-col gap-2">
          <span className="rounded-full border border-[#E5E5E5] bg-[#F4F4F5] px-3.5 py-1.5 text-[11px] font-semibold">
            Product Management Locked
          </span>
          <span className="rounded-full border border-[#E5E5E5] bg-[#F4F4F5] px-3.5 py-1.5 text-[11px] font-semibold">
            Storefront Hidden from Customers
          </span>
        </div>
        <a
          className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-4 text-[14px] font-bold text-white transition active:scale-[0.99]"
          href={buildUpgradeUrl(merchant)}
          target="_blank"
          rel="noreferrer"
        >
          Upgrade - Message Us on WhatsApp
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
