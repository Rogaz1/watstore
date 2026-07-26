import { supabase } from "@/lib/supabase";
import type { Merchant, SubscriptionExpiredFrom } from "./productTypes";
import { buildWhatsAppUrl } from "./publicStoreTypes";

const TRIAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const PLATFORM_WHATSAPP_NUMBER = "233509396861";

export type SubscriptionAccess = {
  canAccess: boolean;
  daysRemaining: number | null;
  expiredFrom: SubscriptionExpiredFrom | null;
  expiryDate: Date | null;
  shouldExpire: boolean;
};

type SubscribableMerchant = Pick<
  Merchant,
  | "id"
  | "trial_start_date"
  | "subscription_status"
  | "billing_cycle_months"
  | "last_payment_date"
  | "subscription_expired_from"
>;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function getSubscriptionAccess(
  merchant: SubscribableMerchant,
): SubscriptionAccess {
  const now = new Date();

  if (merchant.subscription_status === "trial") {
    const trialStart = merchant.trial_start_date
      ? new Date(merchant.trial_start_date)
      : null;
    const expiryDate = trialStart ? addDays(trialStart, TRIAL_DAYS) : null;
    const daysRemaining = expiryDate
      ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS))
      : TRIAL_DAYS;
    const shouldExpire = Boolean(expiryDate && now >= expiryDate);

    return {
      canAccess: !shouldExpire,
      daysRemaining,
      expiredFrom: shouldExpire ? "trial" : null,
      expiryDate,
      shouldExpire,
    };
  }

  if (merchant.subscription_status === "active") {
    const months = merchant.billing_cycle_months;
    const lastPayment = merchant.last_payment_date
      ? new Date(merchant.last_payment_date)
      : null;
    const validCycle = months === 1 || months === 12;
    const expiryDate =
      lastPayment && validCycle ? addDays(lastPayment, months * 30) : null;
    const shouldExpire = Boolean(!expiryDate || now >= expiryDate);

    return {
      canAccess: !shouldExpire,
      daysRemaining: expiryDate
        ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS))
        : null,
      expiredFrom: shouldExpire ? "active" : null,
      expiryDate,
      shouldExpire,
    };
  }

  return {
    canAccess: false,
    daysRemaining: null,
    expiredFrom:
      merchant.subscription_expired_from ??
      (merchant.last_payment_date ? "active" : "trial"),
    expiryDate: null,
    shouldExpire: false,
  };
}

export async function refreshMerchantSubscription<T extends SubscribableMerchant>(
  merchant: T,
) {
  const access = getSubscriptionAccess(merchant);

  if (!access.shouldExpire) {
    return { merchant, access };
  }

  await supabase.rpc("refresh_merchant_subscription", {
    requested_merchant_id: merchant.id,
  });

  const expiredMerchant = {
    ...merchant,
    subscription_status: "expired" as const,
    subscription_expired_from: access.expiredFrom,
  };

  return {
    merchant: expiredMerchant,
    access: getSubscriptionAccess(expiredMerchant),
  };
}

export function buildUpgradeUrl(merchant: Pick<Merchant, "business_name" | "slug">) {
  return buildWhatsAppUrl(
    PLATFORM_WHATSAPP_NUMBER,
    [
      "Hello, I would like to upgrade my account.",
      `Business Name: ${merchant.business_name ?? ""}`,
      `Store: ${merchant.slug ?? ""}`,
    ].join("\n"),
  );
}
