"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StoreUnavailableScreen } from "@/app/components/ExpiredAccessScreen";
import { formatGhsPrice } from "@/app/components/productTypes";
import {
  buildProductMedia,
  buildWhatsAppUrl,
  ProductMedia,
  PublicMerchant,
  PublicProduct,
} from "@/app/components/publicStoreTypes";

type ProductDetailClientProps = {
  slug: string;
  productId: string;
};

type CreateOrderResponse = {
  order_number: number;
};

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="m16 6-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6f3a]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ProductMediaSlide({ media }: { media: ProductMedia }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (media.type === "video") {
    return (
      <div className="relative h-full w-full snap-center">
        {isPlaying ? (
          <video
            className="h-full w-full object-cover"
            controls
            src={media.url}
          />
        ) : (
          <button
            className="relative h-full w-full bg-black text-white"
            type="button"
            onClick={() => setIsPlaying(true)}
          >
            <video
              className="h-full w-full object-cover opacity-80"
              muted
              playsInline
              preload="metadata"
              src={media.url}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55">
                <PlayIcon />
              </span>
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full snap-center bg-[#f1eee6]">
      <img className="h-full w-full object-cover" src={media.url} alt="" />
    </div>
  );
}

function OrderModal({
  merchant,
  product,
  onClose,
}: {
  merchant: PublicMerchant;
  product: PublicProduct;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const total = product.sale_price * quantity;
  const canSubmit = customerName.trim() && deliveryLocation.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { data, error } = await supabase.rpc("create_public_order", {
      requested_product_id: product.id,
      requested_quantity: quantity,
      requested_customer_name: customerName.trim(),
      requested_delivery_location: deliveryLocation.trim(),
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const order = data as CreateOrderResponse;
    const whatsappMessage = [
      `Order #${order.order_number}`,
      "Hello, I'd like to order:",
      `Product: ${product.name}`,
      `Quantity: ${quantity}`,
      `Total: GHS ${total.toFixed(2)}`,
      `Name: ${customerName.trim()}`,
      `Delivery Location: ${deliveryLocation.trim()}`,
    ].join("\n");

    window.open(buildWhatsAppUrl(merchant.whatsapp_number, whatsappMessage), "_blank");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/45 px-4 pb-4 sm:items-center sm:justify-center sm:p-6">
      <form
        className="w-full max-w-md rounded-lg bg-white p-5 text-[#1f2933] shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#52606d]">Order summary</p>
            <h2 className="text-xl font-semibold">{product.name}</h2>
          </div>
          <button
            aria-label="Close order form"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2c4] text-xl leading-none"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-md border border-[#d8d2c4] p-3">
          <span className="font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c3bbab] text-lg font-semibold disabled:opacity-40"
              type="button"
              disabled={quantity === 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c3bbab] text-lg font-semibold"
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>
        </div>

        <p className="mb-5 text-lg font-semibold">Total: {formatGhsPrice(total)}</p>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Name</span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Delivery location
            </span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
              value={deliveryLocation}
              onChange={(event) => setDeliveryLocation(event.target.value)}
              required
            />
          </label>
        </div>

        <p className="mt-4 rounded-md bg-[#edf7ed] px-3 py-2 text-sm font-medium text-[#2f5f3a]">
          You&apos;ll receive payment details on WhatsApp to complete your order.
        </p>

        {message ? (
          <p className="mt-4 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
            {message}
          </p>
        ) : null}

        <button
          className="mt-5 h-12 w-full rounded-md bg-[#2f6f6c] px-4 font-medium text-white transition hover:bg-[#285f5c] disabled:cursor-not-allowed disabled:bg-[#9fb9b7]"
          type="submit"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Creating order..." : "Continue to WhatsApp"}
        </button>
      </form>
    </div>
  );
}

export function ProductDetailClient({ slug, productId }: ProductDetailClientProps) {
  const [merchant, setMerchant] = useState<PublicMerchant | null>(null);
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const media = useMemo(() => (product ? buildProductMedia(product) : []), [product]);
  const benefits = product?.key_benefits?.filter(Boolean) ?? [];

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setMessage("");

      const { data: merchantData, error: merchantError } = await supabase
        .rpc("get_public_merchant_by_slug", { requested_slug: slug })
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setMessage("Store not found.");
        setIsLoading(false);
        return;
      }

      const publicMerchant = merchantData as PublicMerchant;
      setMerchant(publicMerchant);

      if (!publicMerchant.is_available) {
        setIsLoading(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("id", productId)
        .eq("merchant_id", publicMerchant.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (productError || !productData) {
        setMessage("Product not found.");
        setIsLoading(false);
        return;
      }

      setProduct(productData as PublicProduct);
      setIsLoading(false);
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, slug]);

  async function handleShare() {
    if (!product) {
      return;
    }

    const shareText = `${product.name} - ${formatGhsPrice(product.sale_price)}`;

    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: shareText,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    setShareMessage("Link copied.");
    window.setTimeout(() => setShareMessage(""), 2000);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-5 text-[#1f2933]">
        <p className="text-sm font-medium text-[#52606d]">Loading product...</p>
      </main>
    );
  }

  if (!merchant || !product) {
    if (merchant && !merchant.is_available) {
      return <StoreUnavailableScreen />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-5 text-center text-[#1f2933]">
        <p className="text-base font-medium">{message || "Product not found."}</p>
      </main>
    );
  }

  if (!merchant.is_available) {
    return <StoreUnavailableScreen />;
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] pb-28 text-[#1f2933]">
      <section className="relative">
        <div
          className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto scroll-smooth sm:mx-auto sm:aspect-[16/10] sm:max-h-[620px] sm:max-w-3xl"
          onScroll={(event) => {
            const element = event.currentTarget;
            const index = Math.round(element.scrollLeft / element.clientWidth);
            setActiveIndex(index);
          }}
        >
          {media.length ? (
            media.map((item) => (
              <div className="h-full w-full shrink-0 snap-center" key={item.id}>
                <ProductMediaSlide media={item} />
              </div>
            ))
          ) : (
            <div className="flex h-full w-full shrink-0 items-center justify-center bg-[#f1eee6] text-sm font-medium text-[#7b8794]">
              No media
            </div>
          )}
        </div>

        <button
          aria-label="Share product"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1f2933] shadow-sm"
          type="button"
          onClick={handleShare}
        >
          <ShareIcon />
        </button>

        {media.length > 1 ? (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {media.map((item, index) => (
              <span
                className={`h-2 w-2 rounded-full ${
                  index === activeIndex ? "bg-white" : "bg-white/45"
                }`}
                key={item.id}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 py-6">
        {shareMessage ? (
          <p className="mb-4 rounded-md bg-[#edf7ed] px-3 py-2 text-sm font-medium text-[#2f5f3a]">
            {shareMessage}
          </p>
        ) : null}

        <p className="mb-2 text-sm font-medium text-[#52606d]">
          {merchant.business_name}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-semibold">
            {formatGhsPrice(product.sale_price)}
          </span>
          {product.original_price ? (
            <span className="text-base text-[#7b8794] line-through">
              {formatGhsPrice(product.original_price)}
            </span>
          ) : null}
        </div>

        {product.short_description ? (
          <div className="mt-5 rounded-lg bg-[#edf7ed] px-4 py-4 text-base font-medium leading-7 text-[#264f32]">
            {product.short_description}
          </div>
        ) : null}

        {benefits.length ? (
          <section className="mt-6">
            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li className="flex gap-3 text-base leading-7" key={benefit}>
                  <CheckIcon />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <a
          className="mt-7 flex h-12 w-full items-center justify-center rounded-md border border-[#2f6f6c] px-4 font-medium text-[#2f6f6c] transition hover:bg-[#edf7ed]"
          href={buildWhatsAppUrl(
            merchant.whatsapp_number,
            `Hi, I have a question about ${product.name}`,
          )}
          target="_blank"
          rel="noreferrer"
        >
          Chat Us on WhatsApp
        </a>

        {product.long_description ? (
          <section className="mt-9 border-t border-[#ded7c8] pt-7">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[#52606d]">
              About this product
            </p>
            <div className="whitespace-pre-line text-base leading-8 text-[#364152]">
              {product.long_description}
            </div>
          </section>
        ) : null}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ded7c8] bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <button
            className="h-12 w-full rounded-md bg-[#2f6f6c] px-4 font-semibold text-white transition hover:bg-[#285f5c] disabled:cursor-not-allowed disabled:bg-[#9fb9b7]"
            type="button"
            disabled={!product.in_stock}
            onClick={() => setIsOrderOpen(true)}
          >
            {product.in_stock ? "Order on WhatsApp" : "Currently unavailable"}
          </button>
        </div>
      </div>

      {isOrderOpen ? (
        <OrderModal
          merchant={merchant}
          product={product}
          onClose={() => setIsOrderOpen(false)}
        />
      ) : null}
    </main>
  );
}
