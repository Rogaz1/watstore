"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExpiredAccessScreen } from "../components/ExpiredAccessScreen";
import { getMerchantForUser } from "../components/merchantProfile";
import {
  formatGhsPrice,
  formatPrice,
  Merchant,
  Order,
  OrderStatus,
  Product,
} from "../components/productTypes";
import {
  getSubscriptionAccess,
  refreshMerchantSubscription,
} from "../components/subscription";
import { useRequireUser } from "../components/useRequireUser";

type DashboardTab = "products" | "orders";
type OrderFilter = "all" | OrderStatus;
type ProductSummary = Pick<Product, "id" | "name" | "photo_urls">;
type OrderWithProduct = Order & {
  product?: ProductSummary;
};

const orderStatuses: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];
const orderFilters: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const [activeTab, setActiveTab] = useState<DashboardTab>("products");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [message, setMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoadingProducts(true);
      setIsLoadingOrders(true);
      setMessage("");
      setOrderMessage("");

      const { data: merchantData, error: merchantError } =
        await getMerchantForUser(currentUser.id);

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setMerchant(null);
        setProducts([]);
        setOrders([]);
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
        router.replace("/dashboard/setup");
        return;
      }

      const { merchant: refreshedMerchant, access } =
        await refreshMerchantSubscription(merchantData);

      if (!isMounted) {
        return;
      }

      setMerchant(refreshedMerchant);

      if (!access.canAccess) {
        setProducts([]);
        setOrders([]);
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("merchant_id", refreshedMerchant.id)
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

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id,merchant_id,product_id,quantity,customer_name,delivery_location,total,status,order_number,created_at",
        )
        .eq("merchant_id", refreshedMerchant.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (orderError) {
        setOrderMessage(orderError.message);
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      const loadedOrders = (orderData ?? []) as Order[];
      const productIds = Array.from(
        new Set(
          loadedOrders
            .map((order) => order.product_id)
            .filter((productId): productId is string => Boolean(productId)),
        ),
      );

      if (!productIds.length) {
        setOrders(loadedOrders);
        setIsLoadingOrders(false);
        return;
      }

      const { data: orderProducts, error: orderProductsError } = await supabase
        .from("products")
        .select("id,name,photo_urls")
        .eq("merchant_id", refreshedMerchant.id)
        .in("id", productIds);

      if (!isMounted) {
        return;
      }

      if (orderProductsError) {
        setOrderMessage(orderProductsError.message);
        setOrders(loadedOrders);
        setIsLoadingOrders(false);
        return;
      }

      const productsById = new Map(
        ((orderProducts ?? []) as ProductSummary[]).map((product) => [
          product.id,
          product,
        ]),
      );

      setOrders(
        loadedOrders.map((order) => ({
          ...order,
          product: order.product_id
            ? productsById.get(order.product_id)
            : undefined,
        })),
      );
      setIsLoadingOrders(false);
    }

    loadDashboardData();

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

  async function handleOrderStatusChange(order: Order, status: OrderStatus) {
    if (!merchant) {
      return;
    }

    setOrderMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id)
      .eq("merchant_id", merchant.id);

    if (error) {
      setOrderMessage(error.message);
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );
  }

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 text-[#1f2933]">
        <p className="text-sm font-medium text-[#52606d]">Checking session...</p>
      </main>
    );
  }

  if (merchant) {
    const subscriptionAccess = getSubscriptionAccess(merchant);

    if (!subscriptionAccess.canAccess) {
      return (
        <ExpiredAccessScreen
          merchant={merchant}
          expiredFrom={subscriptionAccess.expiredFrom}
        />
      );
    }
  }

  const subscriptionAccess = merchant ? getSubscriptionAccess(merchant) : null;

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
        {subscriptionAccess?.canAccess &&
        merchant?.subscription_status === "trial" &&
        subscriptionAccess.daysRemaining !== null ? (
          <div className="mb-5 rounded-md border border-[#d8d2c4] bg-white px-4 py-3 text-sm font-medium text-[#52606d] shadow-sm">
            Free trial — {subscriptionAccess.daysRemaining} days remaining
          </div>
        ) : null}

        <div className="rounded-lg border border-[#d8d2c4] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 border-b border-[#e2ded6] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-[#52606d]">
                Signed in as {user?.email}
              </p>
              <h2 className="text-xl font-semibold">
                {activeTab === "products" ? "Products" : "Orders"}
              </h2>
            </div>
            {activeTab === "products" ? (
              <Link
                className="flex h-11 items-center justify-center rounded-md bg-[#2f6f6c] px-4 text-sm font-medium text-white transition hover:bg-[#285f5c]"
                href="/dashboard/products/new"
              >
                Add Product
              </Link>
            ) : null}
          </div>

          <div className="mt-5 flex rounded-md border border-[#d8d2c4] bg-[#f5f2ea] p-1">
            {(["products", "orders"] as DashboardTab[]).map((tab) => (
              <button
                className={`h-10 flex-1 rounded px-4 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-white text-[#1f2933] shadow-sm"
                    : "text-[#52606d] hover:text-[#1f2933]"
                }`}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab === "products" ? "Products" : "Orders"}
              </button>
            ))}
          </div>

          {activeTab === "products" && message ? (
            <p className="mt-6 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
              {message}
            </p>
          ) : null}

          {activeTab === "products" && isLoadingProducts ? (
            <p className="py-10 text-sm font-medium text-[#52606d]">
              Loading products...
            </p>
          ) : null}

          {activeTab === "products" && !isLoadingProducts && !products.length && !message ? (
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

          {activeTab === "products" && !isLoadingProducts && products.length ? (
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

          {activeTab === "orders" ? (
            <section className="mt-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {orderFilters.map((filter) => (
                  <button
                    className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
                      orderFilter === filter.value
                        ? "border-[#2f6f6c] bg-[#edf7ed] text-[#2f6f6c]"
                        : "border-[#d8d2c4] text-[#52606d] hover:border-[#2f6f6c] hover:text-[#2f6f6c]"
                    }`}
                    key={filter.value}
                    type="button"
                    onClick={() => setOrderFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {orderMessage ? (
                <p className="mt-4 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
                  {orderMessage}
                </p>
              ) : null}

              {isLoadingOrders ? (
                <p className="py-10 text-sm font-medium text-[#52606d]">
                  Loading orders...
                </p>
              ) : null}

              {!isLoadingOrders && !orders.length && !orderMessage ? (
                <div className="py-12 text-center">
                  <h3 className="text-lg font-semibold">No orders yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-[#52606d]">
                    Share your store link to start selling.
                  </p>
                </div>
              ) : null}

              {!isLoadingOrders && orders.length && !filteredOrders.length ? (
                <p className="py-10 text-center text-sm font-medium text-[#52606d]">
                  No {orderFilter} orders right now.
                </p>
              ) : null}

              {!isLoadingOrders && filteredOrders.length ? (
                <div className="grid gap-4 pt-4">
                  {filteredOrders.map((order) => {
                    const thumbnail = order.product?.photo_urls?.[0];
                    const createdAt = new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(order.created_at));

                    return (
                      <article
                        className="rounded-lg border border-[#d8d2c4] bg-white p-4"
                        key={order.id}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              #{order.order_number}
                            </p>
                            <p className="text-sm text-[#52606d]">
                              {createdAt}
                            </p>
                          </div>
                          <select
                            className={`h-10 rounded-md border px-3 text-sm font-semibold capitalize outline-none ${
                              order.status === "pending"
                                ? "border-[#d9b76f] bg-[#fff8e6] text-[#7a5a00]"
                                : ""
                            } ${
                              order.status === "paid"
                                ? "border-[#8bb7d9] bg-[#edf6ff] text-[#235d84]"
                                : ""
                            } ${
                              order.status === "fulfilled"
                                ? "border-[#9fcf9a] bg-[#edf7ed] text-[#2f6f3a]"
                                : ""
                            } ${
                              order.status === "cancelled"
                                ? "border-[#d99b8f] bg-[#fff4f1] text-[#8f2d20]"
                                : ""
                            }`}
                            value={order.status}
                            onChange={(event) =>
                              handleOrderStatusChange(
                                order,
                                event.target.value as OrderStatus,
                              )
                            }
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[56px_1fr]">
                          <div className="h-14 w-14 overflow-hidden rounded-md border border-[#d8d2c4] bg-[#f5f2ea]">
                            {thumbnail ? (
                              <img
                                className="h-full w-full object-cover"
                                src={thumbnail}
                                alt={order.product?.name ?? "Ordered product"}
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[10px] font-medium text-[#7b8794]">
                                No photo
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {order.product?.name ?? "Product unavailable"}
                            </h3>
                            <p className="mt-1 text-sm text-[#52606d]">
                              {order.customer_name}
                            </p>
                          </div>
                        </div>

                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                          <div>
                            <dt className="text-[#52606d]">Quantity</dt>
                            <dd className="font-semibold">{order.quantity}</dd>
                          </div>
                          <div>
                            <dt className="text-[#52606d]">Total</dt>
                            <dd className="font-semibold">
                              {formatGhsPrice(order.total)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[#52606d]">
                              Delivery location
                            </dt>
                            <dd className="font-semibold">
                              {order.delivery_location}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
