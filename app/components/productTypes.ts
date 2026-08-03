export type Merchant = {
  id: string;
  user_id: string;
  business_name?: string | null;
  tagline?: string | null;
  delivery_info?: string | null;
  payment_options?: string | null;
  why_choose_us?: string | null;
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
  sale_price: number;
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
  quantity: number;
  customer_name: string;
  delivery_location: string;
  total: number;
  status: OrderStatus;
  order_number: number;
  created_at: string;
};

export type PublicOrder = {
  order_number: number;
};

export function formatPrice(value: number | null | undefined) {
  return formatGhsPrice(value);
}

export function formatGhsPrice(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "";
  }

  return `₵${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}
