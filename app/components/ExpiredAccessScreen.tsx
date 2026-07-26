"use client";

import type { Merchant, SubscriptionExpiredFrom } from "./productTypes";
import { buildUpgradeUrl } from "./subscription";

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
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
  const wasTrial = expiredFrom !== "active";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 py-12 text-[#1f2933]">
      <section className="w-full max-w-md rounded-lg border border-[#d8d2c4] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4f1] text-[#8f2d20]">
          <LockIcon />
        </div>
        <h1 className="text-2xl font-semibold">
          {wasTrial ? "Your free trial has ended" : "Your subscription has ended"}
        </h1>
        <p className="mt-3 text-[#52606d]">
          Your store and dashboard are inaccessible until you renew.
        </p>
        <a
          className="mt-7 flex h-12 w-full items-center justify-center rounded-md bg-[#2f6f6c] px-4 font-medium text-white transition hover:bg-[#285f5c]"
          href={buildUpgradeUrl(merchant)}
          target="_blank"
          rel="noreferrer"
        >
          Upgrade — Message Us on WhatsApp
        </a>
      </section>
    </main>
  );
}

export function StoreUnavailableScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-5 text-center text-[#1f2933]">
      <p className="text-lg font-semibold">This store is temporarily unavailable</p>
    </main>
  );
}
