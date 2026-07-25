import { StorefrontClient } from "./StorefrontClient";

type StorefrontPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;

  return <StorefrontClient slug={slug} />;
}
