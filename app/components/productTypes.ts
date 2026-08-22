export type Merchant = {
  id: string;
  user_id: string;
  business_name?: string | null;
  tagline?: string | null;
  delivery_info?: string | null;
  payment_options?: string | null;
  why_choose_us?: string | null;
  currency_code?: CurrencyCode | null;
  preferred_locale?: "en" | "fr" | null;
  country_code?: string | null;
  slug?: string | null;
  whatsapp_number?: string | null;
  logo_url?: string | null;
  trial_start_date?: string | null;
  subscription_status?: SubscriptionStatus | null;
  billing_cycle_months?: number | null;
  last_payment_date?: string | null;
  subscription_expired_from?: SubscriptionExpiredFrom | null;
};

export type SubscriptionStatus = "trial" | "active" | "expired";
export type SubscriptionExpiredFrom = "trial" | "active";

export type Product = {
  id: string;
  merchant_id: string;
  name: string;
  sale_price: number | null;
  original_price: number | null;
  photo_urls: string[] | null;
  video_url: string | null;
  short_description: string | null;
  long_description: string | null;
  key_benefits: string[] | null;
  faqs?: ProductFaq[] | null;
  in_stock: boolean;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export type Order = {
  id: string;
  merchant_id: string;
  product_id: string | null;
  product_name: string | null;
  product_sale_price: number | null;
  product_photo_url: string | null;
  currency_code: CurrencyCode | null;
  quantity: number;
  customer_name: string;
  delivery_location: string;
  total: number | null;
  status: OrderStatus;
  order_number: number;
  created_at: string;
};

export type PublicOrder = {
  order_number: number;
};

export const supportedCurrencies = [
  { code: "GHS", label: "Ghana Cedi", symbol: "\u20B5" },
  { code: "NGN", label: "Nigerian Naira", symbol: "\u20A6" },
  { code: "XOF", label: "West African CFA franc", symbol: "CFA" },
  { code: "XAF", label: "Central African CFA franc", symbol: "FCFA" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "\u00A3" },
  { code: "EUR", label: "Euro", symbol: "\u20AC" },
] as const;

export type CurrencyCode = (typeof supportedCurrencies)[number]["code"];

const currencySymbols = supportedCurrencies.reduce(
  (symbols, currency) => ({
    ...symbols,
    [currency.code]: currency.symbol,
  }),
  {} as Record<CurrencyCode, string>,
);

export function normalizeCurrencyCode(
  value: string | null | undefined,
): CurrencyCode {
  return supportedCurrencies.some((currency) => currency.code === value)
    ? (value as CurrencyCode)
    : "GHS";
}

export function formatPrice(
  value: number | null | undefined,
  currencyCode?: string | null,
  locale = "en",
) {
  return formatCurrency(value, currencyCode, locale);
}

export function formatCurrency(
  value: number | null | undefined,
  currencyCode?: string | null,
  locale = "en",
) {
  if (typeof value !== "number") {
    return "";
  }

  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  const symbol = currencySymbols[normalizedCurrency];
  const amount = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return symbol.length > 1 ? `${symbol} ${amount}` : `${symbol}${amount}`;
}

export function formatGhsPrice(value: number | null | undefined) {
  return formatCurrency(value, "GHS");
}
