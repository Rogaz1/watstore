"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StoreUnavailableScreen } from "@/app/components/ExpiredAccessScreen";
import { formatGhsPrice } from "@/app/components/productTypes";
import type {
  PublicMerchant,
  PublicProduct,
} from "@/app/components/publicStoreTypes";

type StorefrontClientProps = {
  slug: string;
};

function ProductCard({
  product,
  slug,
}: {
  product: PublicProduct;
  slug: string;
}) {
  const thumbnail = product.photo_urls?.[0];
  const card = (
    <article className="flex h-[248px] flex-col overflow-hidden rounded-lg border border-[#E7E4DF] bg-white">
      <div className="h-36 w-full bg-[#FAF9F7]">
        {thumbnail ? (
          <img
            className={`h-full w-full object-cover ${
              product.in_stock ? "" : "opacity-35"
            }`}
            src={thumbnail}
            alt={product.name}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#78716C]">
            No photo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <h2
          className="text-sm font-semibold leading-5"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h2>
        {product.in_stock ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {formatGhsPrice(product.sale_price)}
            </span>
            {product.original_price ? (
              <span className="text-xs text-[#78716C] line-through">
                {formatGhsPrice(product.original_price)}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-[#78716C]">Unavailable</p>
        )}
      </div>
    </article>
  );

  if (!product.in_stock) {
    return card;
  }

  return (
    <Link className="transition hover:opacity-90" href={`/store/${slug}/${product.id}`}>
      {card}
    </Link>
  );
}

export function StorefrontClient({ slug }: StorefrontClientProps) {
  const [merchant, setMerchant] = useState<PublicMerchant | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStorefront() {
      setIsLoading(true);
      setMessage("");

      const { data: merchantData, error: merchantError } = await supabase
        .rpc("get_public_merchant_by_slug", { requested_slug: slug })
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setMerchant(null);
        setProducts([]);
        setMessage("Store not found.");
        setIsLoading(false);
        return;
      }

      const publicMerchant = merchantData as PublicMerchant;
      setMerchant(publicMerchant);

      if (!publicMerchant.is_available) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("merchant_id", publicMerchant.id)
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (productError) {
        setMessage(productError.message);
        setProducts([]);
      } else {
        setProducts((productData ?? []) as PublicProduct[]);
      }

      setIsLoading(false);
    }

    loadStorefront();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-[#1C1917]">
        <p className="text-sm font-medium text-[#78716C]">Loading store...</p>
      </main>
    );
  }

  if (!merchant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#1C1917]">
        <p className="text-base font-medium">{message || "Store not found."}</p>
      </main>
    );
  }

  if (!merchant.is_available) {
    return <StoreUnavailableScreen />;
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-10 text-[#1C1917]">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 py-7">
        {merchant.logo_url ? (
          <img
            className="h-14 w-14 shrink-0 rounded-md border border-[#E7E4DF] object-cover"
            src={merchant.logo_url}
            alt={`${merchant.business_name ?? "Store"} logo`}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[#E7E4DF] bg-[#FAF9F7] text-lg font-semibold">
            {(merchant.business_name ?? "S").charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold">
            {merchant.business_name}
          </h1>
          {merchant.tagline ? (
            <p className="mt-1 truncate text-sm text-[#78716C]">
              {merchant.tagline}
            </p>
          ) : null}
          {merchant.delivery_info ? (
            <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#78716C]">
              <Truck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {merchant.delivery_info}
              </span>
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl">
        {message && !products.length ? (
          <p className="py-10 text-center text-sm text-[#B94A2C]">{message}</p>
        ) : null}

        {!products.length && !message ? (
          <p className="py-16 text-center text-base font-medium text-[#78716C]">
            No products available yet - check back soon!
          </p>
        ) : null}

        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
