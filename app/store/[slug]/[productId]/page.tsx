import { ProductDetailClient } from "./ProductDetailClient";
import { supabase } from "@/lib/supabase";
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

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,faqs,in_stock",
    )
    .eq("id", productId)
    .eq("merchant_id", merchant.id)
    .maybeSingle();

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
