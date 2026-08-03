"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  MapPin,
  Share2,
  ShieldCheck,
  Truck,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StoreUnavailableScreen } from "@/app/components/ExpiredAccessScreen";
import {
  isMissingFaqsColumn,
  PRODUCT_SELECT_BASE,
  PRODUCT_SELECT_WITH_FAQS,
} from "@/app/components/productQueries";
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
  initialMerchant?: PublicMerchant | null;
  initialProduct?: PublicProduct | null;
  initialMessage?: string;
};

type CreateOrderResponse = {
  order_number: number;
};

function CheckIcon() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
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
    <div className="h-full w-full bg-[#F4F4F5]">
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
      "Hello, I'd like to order:",
      `Product: ${product.name}`,
      `Quantity: ${quantity}`,
      `Total: ₵${total.toFixed(2)}`,
      `Name: ${customerName.trim()}`,
      `Delivery Location: ${deliveryLocation.trim()}`,
      `Order #${order.order_number}`,
    ].join("\n");

    window.open(buildWhatsAppUrl(merchant.whatsapp_number, whatsappMessage), "_blank");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/45">
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-6 text-[#111111] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:mx-auto sm:max-w-md"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E5E5E5]" />
        <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
              {thumbnail ? (
                <img className="h-full w-full object-cover" src={thumbnail} alt={product.name} />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="truncate text-[15px] font-bold leading-tight">
                {product.name}
              </h2>
              <p className="mt-1 text-[13px] font-medium leading-none text-[#25D366]">
                {formatGhsPrice(product.sale_price)}
              </p>
            </div>
          </div>
          <button
            aria-label="Close order form"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none text-[#888888] transition hover:bg-[#F4F4F5] hover:text-[#111111]"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <div className="mb-4 flex min-w-0 items-center justify-between gap-4">
          <span className="min-w-0 flex-1 truncate text-xs font-bold">Quantity</span>
          <div className="flex shrink-0 items-center gap-3">
            <button
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-base font-semibold text-[#888888] disabled:opacity-40"
              type="button"
              disabled={quantity === 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              -
            </button>
            <span className="w-6 text-center text-base font-bold">{quantity}</span>
            <button
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-base font-semibold text-[#888888]"
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[#F8F8F8] px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#888888]">
            Total Payable
          </span>
          <span className="shrink-0 text-base font-bold">
            {formatGhsPrice(total)}
          </span>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">Your Full Name</span>
            <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
              <User aria-hidden="true" className="h-4 w-4 shrink-0" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                placeholder="Ama Mensah"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">
              Delivery Location
            </span>
            <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 text-[#888888] transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-[#111111]/10">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#888888]"
                placeholder="East Legon, Accra"
                value={deliveryLocation}
                onChange={(event) => setDeliveryLocation(event.target.value)}
                required
              />
            </div>
          </label>
        </div>

        <p className="mt-4 text-center text-[10px] font-medium leading-4 text-[#999999]">
          You will confirm your order on WhatsApp. No payment required now
        </p>

        {message ? (
          <p className="mt-4 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 py-3.5 text-sm text-[#B91C1C]">
            {message}
          </p>
        ) : null}

        <button
          className="mt-5 w-full rounded-xl bg-[#25D366] px-4 py-4 text-[14px] font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-40"
          type="submit"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Creating order..." : "Continue to WhatsApp ->"}
        </button>
      </form>
    </div>
  );
}

type InfoSheetContent = {
  id: "delivery" | "payment" | "why";
  title: string;
  body: string;
  icon: "delivery" | "payment" | "why";
};

function InfoIcon({
  type,
  className = "h-4 w-4",
}: {
  type: InfoSheetContent["icon"];
  className?: string;
}) {
  if (type === "payment") {
    return <CreditCard aria-hidden="true" className={className} strokeWidth={1.7} />;
  }

  if (type === "why") {
    return <ShieldCheck aria-hidden="true" className={className} strokeWidth={1.7} />;
  }

  return <Truck aria-hidden="true" className={className} strokeWidth={1.7} />;
}

function InfoSheet({
  content,
  onClose,
}: {
  content: InfoSheetContent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/45">
      <section className="max-h-[72vh] w-full overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-6 text-[#111111] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:mx-auto sm:max-w-md">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E5E5E5]" />
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#111111]">
              <InfoIcon type={content.icon} />
            </span>
            <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold">
              {content.title}
            </h2>
          </div>
          <button
            aria-label={`Close ${content.title.toLowerCase()}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#888888] transition hover:bg-[#F4F4F5] hover:text-[#111111]"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm font-medium leading-7 text-[#555555] [overflow-wrap:anywhere]">
          {content.body}
        </p>
      </section>
    </div>
  );
}

function ProductInfoRow({
  content,
  onOpen,
}: {
  content: InfoSheetContent;
  onOpen: (content: InfoSheetContent) => void;
}) {
  return (
    <button
      className="flex w-full min-w-0 items-center gap-3 border-t border-[#E5E5E5] px-0 py-4 text-left text-[13px] font-medium text-[#111111]"
      type="button"
      onClick={() => onOpen(content)}
    >
      <InfoIcon type={content.icon} className="h-4 w-4 shrink-0 text-[#111111]" />
      <span className="min-w-0 flex-1 truncate">{content.title}</span>
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#888888]" strokeWidth={1.8} />
    </button>
  );
}

export function ProductDetailClient({
  slug,
  productId,
  initialMerchant = null,
  initialProduct = null,
  initialMessage = "",
}: ProductDetailClientProps) {
  const [merchant, setMerchant] = useState<PublicMerchant | null>(initialMerchant);
  const [product, setProduct] = useState<PublicProduct | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialMerchant && !initialProduct && !initialMessage);
  const [message, setMessage] = useState(initialMessage);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [activeInfoSheet, setActiveInfoSheet] = useState<InfoSheetContent | null>(null);
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const [isNameExpandable, setIsNameExpandable] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const nameRef = useRef<HTMLHeadingElement | null>(null);

  const media = useMemo(() => (product ? buildProductMedia(product) : []), [product]);
  const benefits = product?.key_benefits?.filter(Boolean) ?? [];
  const faqs = product?.faqs?.filter((faq) => faq.question && faq.answer) ?? [];
  const productInfoRows = useMemo<InfoSheetContent[]>(() => {
    if (!merchant) {
      return [];
    }

    return [
      merchant.delivery_info
        ? {
            id: "delivery" as const,
            title: "Delivery Information",
            body: merchant.delivery_info,
            icon: "delivery" as const,
          }
        : null,
      merchant.payment_options
        ? {
            id: "payment" as const,
            title: "Payment Options",
            body: merchant.payment_options,
            icon: "payment" as const,
          }
        : null,
      merchant.why_choose_us
        ? {
            id: "why" as const,
            title: "Why Choose Us",
            body: merchant.why_choose_us,
            icon: "why" as const,
          }
        : null,
    ].filter(Boolean) as InfoSheetContent[];
  }, [merchant]);
  const discountPercent =
    product?.original_price && product.original_price > product.sale_price
      ? Math.round((1 - product.sale_price / product.original_price) * 100)
      : null;

  useEffect(() => {
    if (!nameRef.current || isNameExpanded) {
      return;
    }

    function checkTitleOverflow() {
      const title = nameRef.current;
      if (!title) {
        return;
      }

      const nextValue = title.scrollHeight > title.clientHeight + 1;
      setIsNameExpandable((current) =>
        current === nextValue ? current : nextValue,
      );
    }

    checkTitleOverflow();
    window.addEventListener("resize", checkTitleOverflow);

    return () => window.removeEventListener("resize", checkTitleOverflow);
  }, [product?.name, isNameExpanded]);

  useEffect(() => {
    if (initialMerchant || initialProduct || initialMessage) {
      return;
    }

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

      const productResult = await supabase
        .from("products")
        .select(PRODUCT_SELECT_WITH_FAQS)
        .eq("id", productId)
        .eq("merchant_id", publicMerchant.id)
        .maybeSingle();
      let productData = productResult.data as PublicProduct | null;
      let productError: unknown = productResult.error;

      if (isMissingFaqsColumn(productError)) {
        const fallback = await supabase
          .from("products")
          .select(PRODUCT_SELECT_BASE)
          .eq("id", productId)
          .eq("merchant_id", publicMerchant.id)
          .maybeSingle();

        productData = fallback.data as PublicProduct | null;
        productError = fallback.error;
      }

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
  }, [initialMerchant, initialMessage, initialProduct, productId, slug]);

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
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareMessage("Link copied!");
      window.setTimeout(() => setShareMessage(""), 2000);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareMessage("Link copied!");
      window.setTimeout(() => setShareMessage(""), 2000);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-[#111111]">
        <p className="text-sm font-medium text-[#888888]">Loading product...</p>
      </main>
    );
  }

  if (!merchant || !product) {
    if (merchant && !merchant.is_available) {
      return <StoreUnavailableScreen />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#111111]">
        <p className="text-base font-medium">{message || "Product not found."}</p>
      </main>
    );
  }

  if (!merchant.is_available) {
    return <StoreUnavailableScreen />;
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-[#111111]">
      <section className="relative">
        <div
          className="relative aspect-square w-full overflow-hidden bg-[#F4F4F5]"
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
              <div className="flex h-full w-full shrink-0 items-center justify-center bg-[#F4F4F5] text-sm font-medium text-[#888888]">
                No media
              </div>
            )}
          </div>

          <button
            aria-label="Share product"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white/95 text-[#111111] shadow-sm"
            type="button"
            onClick={handleShare}
          >
            <Share2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
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

      <section className="relative z-10 -mt-6 mx-auto w-full max-w-3xl min-w-0 overflow-hidden rounded-t-[28px] bg-white px-5 pb-6 pt-5">
        {shareMessage ? (
          <p className="mb-4 rounded-2xl bg-[#EDFBF3] px-4 py-3.5 text-sm font-medium text-[#0A5C2B]">
            {shareMessage}
          </p>
        ) : null}

        <div className="relative min-w-0">
          <h1
            ref={nameRef}
            className={`min-w-0 break-words text-[20px] font-bold leading-[27px] [overflow-wrap:anywhere] ${
              isNameExpanded ? "" : "line-clamp-2"
            } ${isNameExpandable ? "pr-7" : ""}`}
          >
            {product.name}
          </h1>
          {isNameExpandable ? (
            <button
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[#555555] transition hover:bg-[#F4F4F5] ${
                isNameExpanded ? "mt-1" : "absolute bottom-0 right-0"
              }`}
              type="button"
              aria-label={isNameExpanded ? "Collapse product name" : "Expand product name"}
              onClick={() => setIsNameExpanded((current) => !current)}
            >
              {isNameExpanded ? (
                <ChevronUp aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              ) : (
                <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 overflow-hidden">
          <span className="shrink-0 text-[24px] font-bold leading-none">
            {formatGhsPrice(product.sale_price)}
          </span>
          {product.original_price ? (
            <span className="min-w-0 truncate text-[14px] font-bold text-[#BDB9B2] line-through">
              {formatGhsPrice(product.original_price)}
            </span>
          ) : null}
          {discountPercent ? (
            <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#B91C1C]">
              {discountPercent}% off
            </span>
          ) : null}
        </div>

        {product.short_description ? (
          <div className="mt-5 min-w-0 break-words rounded-2xl bg-[#EDFBF3] px-4 py-4 text-[13.5px] font-medium leading-6 text-[#0A5C2B] [overflow-wrap:anywhere]">
            {product.short_description}
          </div>
        ) : null}

        {benefits.length ? (
          <section className="mt-6">
            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li className="flex min-w-0 gap-3 text-[13.5px] font-medium leading-6" key={benefit}>
                  <CheckIcon />
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {productInfoRows.length ? (
          <section className="mt-6">
            {productInfoRows.map((row) => (
              <ProductInfoRow content={row} key={row.id} onOpen={setActiveInfoSheet} />
            ))}
          </section>
        ) : null}

        <a
          className="mt-7 flex w-full items-center justify-center rounded-xl border-[1.5px] border-[#25D366] px-4 py-3.5 text-[13px] font-semibold text-[#25D366] transition active:opacity-70"
          href={buildWhatsAppUrl(
            merchant.whatsapp_number,
            `Hi, I have a question about ${product.name}`,
          )}
          target="_blank"
          rel="noreferrer"
        >
          Have a Question? Chat Us on WhatsApp
        </a>

        {product.long_description ? (
          <section className="mt-9 border-t border-[#E5E5E5] pt-7">
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#888888]">
              About this product
            </p>
            <div className="whitespace-pre-line break-words text-sm font-normal leading-7 text-[#111111] [overflow-wrap:anywhere]">
              {product.long_description}
            </div>
          </section>
        ) : null}

        {faqs.length ? (
          <section className="mt-9 border-t border-[#E5E5E5] pt-7">
            <p className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAAAAA]">
              Frequently asked questions
            </p>
            <div className={openFaqIndex === null ? "grid gap-3" : "grid"}>
              {faqs.map((faq, index) => (
                <div
                  className={
                    openFaqIndex === null
                      ? "min-w-0 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white"
                      : "min-w-0 border-b border-[#E5E5E5] py-4 last:border-b-0"
                  }
                  key={`${faq.question}-${index}`}
                >
                  <button
                    className={
                      openFaqIndex === null
                        ? "flex min-w-0 w-full items-center justify-between gap-3 px-4 py-4 text-left text-[13px] font-bold"
                        : "flex min-w-0 w-full items-center justify-between gap-3 text-left text-[13px] font-bold"
                    }
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((current) =>
                        current === index ? null : index,
                      )
                    }
                  >
                    <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        openFaqIndex === index
                          ? "bg-[#1A1A18] text-white"
                          : "border border-[#D8D4CE] bg-white text-[#AAAAAA]"
                      }`}
                    >
                      {openFaqIndex === index ? (
                        <ChevronUp aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={2.5} />
                      ) : (
                        <ChevronDown aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={2.5} />
                      )}
                    </span>
                  </button>
                  {openFaqIndex === index ? (
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm font-normal leading-7 text-[#555555] [overflow-wrap:anywhere]">
                      {faq.answer}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5E5E5] bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <button
            className="w-full rounded-xl bg-[#25D366] px-4 py-4 text-[14px] font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-40"
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

      {activeInfoSheet ? (
        <InfoSheet
          content={activeInfoSheet}
          onClose={() => setActiveInfoSheet(null)}
        />
      ) : null}
    </main>
  );
}
