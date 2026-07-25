"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMerchantForUser } from "../components/merchantProfile";
import { formatPrice, Merchant, Product } from "../components/productTypes";
import { useRequireUser } from "../components/useRequireUser";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isMounted = true;

    async function loadProducts() {
      setIsLoadingProducts(true);
      setMessage("");

      const { data: merchantData, error: merchantError } =
        await getMerchantForUser(currentUser.id);

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setMerchant(null);
        setProducts([]);
        setIsLoadingProducts(false);
        router.replace("/dashboard/setup");
        return;
      }

      setMerchant(merchantData);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("merchant_id", merchantData.id)
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (productError) {
        setMessage(productError.message);
        setProducts([]);
      } else {
        setProducts((productData ?? []) as Product[]);
      }

      setIsLoadingProducts(false);
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [router, user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleDelete(product: Product) {
    if (!merchant) {
      return;
    }

    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("merchant_id", merchant.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 text-[#1f2933]">
        <p className="text-sm font-medium text-[#52606d]">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#1f2933]">
      <header className="border-b border-[#d8d2c4] bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5d6b5c]">
              Watstore
            </p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <button
            className="rounded-md border border-[#c3bbab] px-4 py-2 text-sm font-medium transition hover:border-[#2f6f6c] hover:text-[#2f6f6c]"
            type="button"
            onClick={handleSignOut}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-lg border border-[#d8d2c4] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 border-b border-[#e2ded6] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-[#52606d]">
                Signed in as {user?.email}
              </p>
              <h2 className="text-xl font-semibold">Products</h2>
            </div>
            <Link
              className="flex h-11 items-center justify-center rounded-md bg-[#2f6f6c] px-4 text-sm font-medium text-white transition hover:bg-[#285f5c]"
              href="/dashboard/products/new"
            >
              Add Product
            </Link>
          </div>

          {message ? (
            <p className="mt-6 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
              {message}
            </p>
          ) : null}

          {isLoadingProducts ? (
            <p className="py-10 text-sm font-medium text-[#52606d]">
              Loading products...
            </p>
          ) : null}

          {!isLoadingProducts && !products.length && !message ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="mx-auto mt-2 max-w-md text-[#52606d]">
                Add your first product when you are ready. It will appear here
                before anything goes live on the storefront.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#2f6f6c] px-4 text-sm font-medium text-white transition hover:bg-[#285f5c]"
                href="/dashboard/products/new"
              >
                Add Product
              </Link>
            </div>
          ) : null}

          {!isLoadingProducts && products.length ? (
            <div className="divide-y divide-[#e2ded6]">
              {products.map((product) => {
                const thumbnail = product.photo_urls?.[0];

                return (
                  <div
                    className="grid gap-4 py-5 sm:grid-cols-[72px_1fr_auto] sm:items-center"
                    key={product.id}
                  >
                    <Link
                      className="block h-20 w-20 overflow-hidden rounded-md border border-[#d8d2c4] bg-[#f5f2ea] sm:h-[72px] sm:w-[72px]"
                      href={`/dashboard/products/${product.id}`}
                    >
                      {thumbnail ? (
                        <img
                          className="h-full w-full object-cover"
                          src={thumbnail}
                          alt={product.name}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#7b8794]">
                          No photo
                        </span>
                      )}
                    </Link>

                    <Link
                      className="min-w-0"
                      href={`/dashboard/products/${product.id}`}
                    >
                      <h3 className="truncate text-lg font-semibold">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {formatPrice(product.sale_price)}
                        </span>
                        {product.original_price ? (
                          <span className="text-sm text-[#7b8794] line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            product.in_stock
                              ? "bg-[#e2f2df] text-[#2f6f3a]"
                              : "bg-[#f4ded8] text-[#8f2d20]"
                          }`}
                        >
                          {product.in_stock ? "In stock" : "Out of stock"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex gap-2 sm:justify-end">
                      <Link
                        className="flex h-10 items-center justify-center rounded-md border border-[#c3bbab] px-4 text-sm font-medium transition hover:border-[#2f6f6c] hover:text-[#2f6f6c]"
                        href={`/dashboard/products/${product.id}`}
                      >
                        Edit
                      </Link>
                      <button
                        className="h-10 rounded-md border border-[#d99b8f] px-4 text-sm font-medium text-[#8f2d20] transition hover:bg-[#fff4f1]"
                        type="button"
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
