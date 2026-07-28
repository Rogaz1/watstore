"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { Truck } from "lucide-react";
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
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1DA851]">
      <svg
        aria-hidden="true"
        className="h-3 w-3 text-white"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ProductMediaSlide({ media }: { media: ProductMedia }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (media.type === "video") {
    return (
      <div className="relative h-full w-full bg-black">
        {isPlaying ? (
          <video className="h-full w-full object-cover" controls src={media.url} />
        ) : (
          <button
            className="relative h-full w-full text-white"
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
    <div className="h-full w-full bg-[#FAF9F7]">
      <img className="h-full w-full object-cover" src={media.url} alt="" />
    </div>
  );
}

function OrderSheet({
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
  const thumbnail = product.photo_urls?.[0];

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
    <div className="fixed inset-0 z-40 flex items-end bg-black/45">
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-3 text-[#1C1917] shadow-xl sm:mx-auto sm:max-w-lg"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E7E4DF]" />
        <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#E7E4DF] bg-[#FAF9F7]">
              {thumbnail ? (
                <img className="h-full w-full object-cover" src={thumbnail} alt={product.name} />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#78716C]">Order summary</p>
              <h2 className="truncate text-lg font-semibold">{product.name}</h2>
              <p className="mt-1 text-sm font-semibold">
                {formatGhsPrice(product.sale_price)}
              </p>
            </div>
          </div>
          <button
            aria-label="Close order form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E4DF] text-xl leading-none"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <div className="mb-5 flex min-w-0 items-center justify-between gap-4 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] p-3">
          <span className="min-w-0 flex-1 truncate font-medium">Quantity</span>
          <div className="flex shrink-0 items-center gap-3">
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E4DF] bg-white text-lg font-semibold disabled:opacity-40"
              type="button"
              disabled={quantity === 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E4DF] bg-white text-lg font-semibold"
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>
        </div>

        <p className="mb-5 text-lg font-semibold">
          Total Payable: {formatGhsPrice(total)}
        </p>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Name</span>
            <input
              className="h-12 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
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
              className="h-12 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
              value={deliveryLocation}
              onChange={(event) => setDeliveryLocation(event.target.value)}
              required
            />
          </label>
        </div>

        <p className="mt-4 rounded-md bg-[#EAF7EF] px-3 py-2 text-sm font-medium text-[#0F6B34]">
          You&apos;ll receive payment details on WhatsApp to complete your order.
        </p>

        {merchant.delivery_info ? (
          <p className="mt-3 flex min-w-0 items-start gap-2 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm font-medium text-[#78716C]">
            <Truck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{merchant.delivery_info}</span>
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
            {message}
          </p>
        ) : null}

        <button
          className="mt-5 h-12 w-full rounded-md bg-[#1DA851] px-4 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#78716C]"
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
  const touchStartX = useRef(0);

  const media = useMemo(() => (product ? buildProductMedia(product) : []), [product]);
  const benefits = product?.key_benefits?.filter(Boolean) ?? [];
  const discountPercent =
    product?.original_price && product.original_price > product.sale_price
      ? Math.round((1 - product.sale_price / product.original_price) * 100)
      : null;

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

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (media.length < 2) {
      return;
    }

    const delta = touchStartX.current - event.changedTouches[0].clientX;

    if (Math.abs(delta) < 40) {
      return;
    }

    setActiveIndex((current) => {
      if (delta > 0) {
        return Math.min(media.length - 1, current + 1);
      }

      return Math.max(0, current - 1);
    });
  }

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
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-[#1C1917]">
        <p className="text-sm font-medium text-[#78716C]">Loading product...</p>
      </main>
    );
  }

  if (!merchant || !product) {
    if (merchant && !merchant.is_available) {
      return <StoreUnavailableScreen />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#1C1917]">
        <p className="text-base font-medium">{message || "Product not found."}</p>
      </main>
    );
  }

  if (!merchant.is_available) {
    return <StoreUnavailableScreen />;
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-[#1C1917]">
      <section className="relative">
        <div
          className="relative aspect-square w-full overflow-hidden bg-[#FAF9F7] sm:mx-auto sm:max-w-3xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {media.length ? (
              media.map((item) => (
                <div className="h-full w-full shrink-0" key={item.id}>
                  <ProductMediaSlide media={item} />
                </div>
              ))
            ) : (
              <div className="flex h-full w-full shrink-0 items-center justify-center bg-[#FAF9F7] text-sm font-medium text-[#78716C]">
                No media
              </div>
            )}
          </div>

          {discountPercent ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#1C1917] shadow-sm">
              {discountPercent}% off
            </span>
          ) : null}

          <button
            aria-label="Share product"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1C1917] shadow-sm"
            type="button"
            onClick={handleShare}
          >
            <ShareIcon />
          </button>

          {media.length > 1 ? (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {media.map((item, index) => (
                <button
                  aria-label={`Show media ${index + 1}`}
                  className="h-1.5 rounded-full bg-white transition-all"
                  key={item.id}
                  style={{
                    opacity: index === activeIndex ? 1 : 0.55,
                    width: index === activeIndex ? 18 : 6,
                  }}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 py-6">
        {shareMessage ? (
          <p className="mb-4 rounded-md bg-[#EAF7EF] px-3 py-2 text-sm font-medium text-[#0F6B34]">
            {shareMessage}
          </p>
        ) : null}

        <p className="mb-2 text-sm font-medium text-[#78716C]">
          {merchant.business_name}
        </p>
        <h1 className="text-3xl font-semibold leading-tight">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-semibold">
            {formatGhsPrice(product.sale_price)}
          </span>
          {product.original_price ? (
            <span className="text-base text-[#78716C] line-through">
              {formatGhsPrice(product.original_price)}
            </span>
          ) : null}
        </div>

        {product.short_description ? (
          <div className="mt-5 rounded-lg bg-[#EAF7EF] px-4 py-4 text-base font-medium leading-7 text-[#0F6B34]">
            {product.short_description}
          </div>
        ) : null}

        {merchant.delivery_info ? (
          <div className="mt-3 flex min-w-0 items-start gap-2 rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-4 py-3 text-sm font-medium leading-6 text-[#78716C]">
            <Truck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{merchant.delivery_info}</span>
          </div>
        ) : null}

        {benefits.length ? (
          <section className="mt-6">
            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li className="flex min-w-0 gap-3 text-base leading-7" key={benefit}>
                  <CheckIcon />
                  <span className="min-w-0 flex-1">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <a
          className="mt-7 flex h-12 w-full items-center justify-center rounded-md border border-[#1DA851] px-4 font-medium text-[#1DA851] transition hover:bg-[#EAF7EF]"
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
          <section className="mt-9 border-t border-[#E7E4DF] pt-7">
            <p className="mb-3 text-sm font-medium uppercase text-[#78716C]">
              About this product
            </p>
            <div className="whitespace-pre-line text-base leading-8 text-[#1C1917]">
              {product.long_description}
            </div>
          </section>
        ) : null}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E7E4DF] bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <button
            className="h-12 w-full rounded-md bg-[#1DA851] px-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#78716C]"
            type="button"
            disabled={!product.in_stock}
            onClick={() => setIsOrderOpen(true)}
          >
            {product.in_stock ? "Order on WhatsApp" : "Currently unavailable"}
          </button>
        </div>
      </div>

      {isOrderOpen ? (
        <OrderSheet
          merchant={merchant}
          product={product}
          onClose={() => setIsOrderOpen(false)}
        />
      ) : null}
    </main>
  );
}
