import { ProductForm } from "@/app/components/ProductForm";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return <ProductForm productId={id} />;
}
