export type Merchant = {
  id: string;
  user_id: string;
  business_name?: string | null;
  slug?: string | null;
  whatsapp_number?: string | null;
  logo_url?: string | null;
};

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
  in_stock: boolean;
};

export function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
