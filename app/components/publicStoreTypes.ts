import type { Merchant, Product } from "./productTypes";

export type PublicMerchant = Pick<
  Merchant,
  | "id"
  | "business_name"
  | "tagline"
  | "delivery_info"
  | "payment_options"
  | "why_choose_us"
  | "slug"
  | "whatsapp_number"
  | "logo_url"
> & {
  is_available: boolean;
};

export type PublicProduct = Product;

export type ProductMedia = {
  id: string;
  type: "image" | "video";
  url: string;
};

export function buildProductMedia(product: PublicProduct) {
  const media: ProductMedia[] = (product.photo_urls ?? []).map((url, index) => ({
    id: `image-${index}`,
    type: "image",
    url,
  }));

  if (product.video_url) {
    media.push({
      id: "video",
      type: "video",
      url: product.video_url,
    });
  }

  return media;
}

export function buildWhatsAppUrl(number: string | null | undefined, message: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
