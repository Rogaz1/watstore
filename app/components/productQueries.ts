export const PRODUCT_SELECT_BASE =
  "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock";

export const PRODUCT_SELECT_WITH_FAQS = `${PRODUCT_SELECT_BASE},faqs`;

export function isMissingFaqsColumn(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { code, message } = error as { code?: string; message?: string };
  const normalizedMessage = message?.toLowerCase() ?? "";

  return (
    code === "42703" ||
    code === "PGRST204" ||
    (normalizedMessage.includes("faqs") &&
      (normalizedMessage.includes("column") ||
        normalizedMessage.includes("schema cache")))
  );
}
