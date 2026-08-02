import { ProductDetailClient } from "./ProductDetailClient";
import { supabase } from "@/lib/supabase";
import {
  isMissingFaqsColumn,
  PRODUCT_SELECT_BASE,
  PRODUCT_SELECT_WITH_FAQS,
} from "@/app/components/productQueries";
import type {
  PublicMerchant,
  PublicProduct,
} from "@/app/components/publicStoreTypes";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug, productId } = await params;
  const { data: merchantData, error: merchantError } = await supabase
    .rpc("get_public_merchant_by_slug", { requested_slug: slug })
    .maybeSingle();

  if (merchantError || !merchantData) {
    return (
      <ProductDetailClient
        slug={slug}
        productId={productId}
        initialMessage="Store not found."
      />
    );
  }

  const merchant = merchantData as PublicMerchant;

  if (!merchant.is_available) {
    return (
      <ProductDetailClient
        slug={slug}
        productId={productId}
        initialMerchant={merchant}
      />
    );
  }

  const productResult = await supabase
    .from("products")
    .select(PRODUCT_SELECT_WITH_FAQS)
    .eq("id", productId)
    .eq("merchant_id", merchant.id)
    .maybeSingle();
  let productData = productResult.data as PublicProduct | null;
  let productError: unknown = productResult.error;

  if (isMissingFaqsColumn(productError)) {
    const fallback = await supabase
      .from("products")
      .select(PRODUCT_SELECT_BASE)
      .eq("id", productId)
      .eq("merchant_id", merchant.id)
      .maybeSingle();

    productData = fallback.data as PublicProduct | null;
    productError = fallback.error;
  }

  if (productError || !productData) {
    return (
      <ProductDetailClient
        slug={slug}
        productId={productId}
        initialMerchant={merchant}
        initialMessage="Product not found."
      />
    );
  }

  return (
    <ProductDetailClient
      slug={slug}
      productId={productId}
      initialMerchant={merchant}
      initialProduct={productData as PublicProduct}
    />
  );
}
