import { ProductDetailClient } from "./ProductDetailClient";

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

  return <ProductDetailClient slug={slug} productId={productId} />;
}
