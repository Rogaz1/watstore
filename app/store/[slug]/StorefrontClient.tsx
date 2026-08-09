"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
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
    <article className="flex h-[210px] flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
      <div className="relative h-[128px] w-full bg-[#F4F4F5]">
        {thumbnail ? (
          <img
            className={`h-full w-full object-cover ${
              product.in_stock ? "" : "opacity-30"
            }`}
            src={thumbnail}
            alt={product.name}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#888888]">
            No photo
          </span>
        )}
        {!product.in_stock ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[12px] font-semibold text-[#888888] shadow-sm">
            Out of stock
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2">
        <h2
          className="text-[13px] font-semibold leading-[17px] text-[#111111]"
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
          <div className="mt-2 flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 text-[13px] font-bold">
              {formatGhsPrice(product.sale_price) || "Price on request"}
            </span>
            {product.sale_price !== null && product.original_price ? (
              <span className="min-w-0 truncate text-[12px] font-medium text-[#CCCCCC] line-through">
                {formatGhsPrice(product.original_price)}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs font-medium text-[#888888]">--</p>
        )}
      </div>
    </article>
  );

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
        .is("deleted_at", null)
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
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-[#111111]">
        <p className="text-sm font-medium text-[#888888]">Loading store...</p>
      </main>
    );
  }

  if (!merchant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#111111]">
        <p className="text-base font-medium">{message || "Store not found."}</p>
      </main>
    );
  }

  if (!merchant.is_available) {
    return <StoreUnavailableScreen />;
  }

  return (
    <main className="min-h-screen bg-[#F4F4F5] pb-8 text-[#111111]">
      <header className="bg-white px-5 pb-7 pt-16 sm:px-7">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-2xl bg-[#111111] text-white">
            {merchant.logo_url ? (
              <img
                className="block h-full w-full object-cover"
                src={merchant.logo_url}
                alt={`${merchant.business_name ?? "Store"} logo`}
                style={{ width: 52, height: 52, maxWidth: 52, maxHeight: 52 }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <Store aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
              </span>
            )}
          </div>
          <div className="mt-3 min-w-0 max-w-[260px] overflow-hidden">
            <h1 className="truncate text-[18px] font-bold leading-none">
              {merchant.business_name}
            </h1>
            {merchant.tagline ? (
              <p className="mt-1.5 block max-w-full overflow-hidden truncate whitespace-nowrap text-[11px] font-medium text-[#888888]">
                {merchant.tagline}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-5 pt-4 sm:px-7">
        {message && !products.length ? (
          <p className="py-10 text-center text-sm text-[#B91C1C]">{message}</p>
        ) : null}

        {!products.length && !message ? (
          <p className="py-16 text-center text-base font-medium text-[#888888]">
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
