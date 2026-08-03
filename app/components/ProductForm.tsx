"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  GripVertical,
  Lightbulb,
  Plus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExpiredAccessScreen } from "./ExpiredAccessScreen";
import { compressImageForUpload } from "./imageCompression";
import { getMerchantForUser } from "./merchantProfile";
import {
  isMissingFaqsColumn,
  PRODUCT_SELECT_BASE,
  PRODUCT_SELECT_WITH_FAQS,
} from "./productQueries";
import { Merchant, Product, ProductFaq } from "./productTypes";
import {
  getSubscriptionAccess,
  refreshMerchantSubscription,
} from "./subscription";
import { useRequireUser } from "./useRequireUser";

const PRODUCT_MEDIA_BUCKET = "product-media";
const MAX_BENEFITS = 5;
const MAX_FAQS = 5;
const MAX_IMAGES = 5;
const MAX_BENEFIT_CHARS = 64;
const MAX_SHORT_DESCRIPTION_CHARS = 150;
const MAX_FAQ_QUESTION_CHARS = 90;
const MAX_FAQ_ANSWER_CHARS = 140;

type MediaItem = {
  id: string;
  file?: File;
  url?: string;
  previewUrl: string;
};

type ProductFormProps = {
  productId?: string;
};

function cleanFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

function makeMediaItem(file: File): MediaItem {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const userId = user?.id;
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [name, setName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [video, setVideo] = useState<MediaItem | null>(null);
  const [shortDescription, setShortDescription] = useState("");
  const [keyBenefits, setKeyBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [message, setMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isEditing = Boolean(productId);

  const canSave = useMemo(
    () => name.trim() && salePrice !== "" && merchant,
    [merchant, name, salePrice],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    const currentUserId = userId;
    let isMounted = true;

    async function loadMerchantAndProduct() {
      setIsLoading(true);
      setMessage("");

      const { data: merchantData, error: merchantError } =
        await getMerchantForUser(currentUserId);

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setIsLoading(false);
        router.replace("/dashboard/setup");
        return;
      }

      const { merchant: refreshedMerchant } =
        await refreshMerchantSubscription(merchantData);

      if (!isMounted) {
        return;
      }

      setMerchant(refreshedMerchant);

      if (!productId) {
        setIsLoading(false);
        return;
      }

      const productResult = await supabase
        .from("products")
        .select(PRODUCT_SELECT_WITH_FAQS)
        .eq("id", productId)
        .eq("merchant_id", refreshedMerchant.id)
        .single();
      let product = productResult.data as Product | null;
      let productError: unknown = productResult.error;

      if (isMissingFaqsColumn(productError)) {
        const fallback = await supabase
          .from("products")
          .select(PRODUCT_SELECT_BASE)
          .eq("id", productId)
          .eq("merchant_id", refreshedMerchant.id)
          .single();

        product = fallback.data as Product | null;
        productError = fallback.error;
      }

      if (!isMounted) {
        return;
      }

      if (productError || !product) {
        setMessage("This product was not found for your merchant account.");
        setIsLoading(false);
        return;
      }

      const loadedProduct = product as Product;
      setName(loadedProduct.name ?? "");
      setSalePrice(String(loadedProduct.sale_price ?? ""));
      setOriginalPrice(
        loadedProduct.original_price === null
          ? ""
          : String(loadedProduct.original_price),
      );
      setImages(
        (loadedProduct.photo_urls ?? [])
          .slice(0, MAX_IMAGES)
          .map((url) => ({
            id: crypto.randomUUID(),
            url,
            previewUrl: url,
          })),
      );
      setVideo(
        loadedProduct.video_url
          ? {
              id: crypto.randomUUID(),
              url: loadedProduct.video_url,
              previewUrl: loadedProduct.video_url,
            }
          : null,
      );
      setShortDescription(loadedProduct.short_description ?? "");
      setKeyBenefits(
        (loadedProduct.key_benefits ?? [])
          .filter(Boolean)
          .map((benefit) => benefit.slice(0, MAX_BENEFIT_CHARS))
          .slice(0, MAX_BENEFITS),
      );
      setLongDescription(loadedProduct.long_description ?? "");
      setFaqs(
        (loadedProduct.faqs ?? [])
          .filter((faq) => faq?.question?.trim() && faq?.answer?.trim())
          .slice(0, MAX_FAQS),
      );
      setInStock(loadedProduct.in_stock);
      setIsLoading(false);
    }

    loadMerchantAndProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, router, userId]);

  async function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setIsCompressingImages(true);
    setMessage("");

    try {
      const availableSlots = Math.max(0, MAX_IMAGES - images.length);
      const acceptedFiles = files.slice(0, availableSlots);

      if (!acceptedFiles.length) {
        setMessage(`You can upload up to ${MAX_IMAGES} images per product.`);
        return;
      }

      const compressedFiles = await Promise.all(
        acceptedFiles.map((file) => compressImageForUpload(file)),
      );
      setImages((current) => [
        ...current,
        ...compressedFiles.map(makeMediaItem),
      ]);

      if (files.length > acceptedFiles.length) {
        setMessage(`Only ${MAX_IMAGES} images are allowed per product.`);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to compress image.",
      );
    } finally {
      setIsCompressingImages(false);
    }
  }

  function moveImage(fromIndex: number, toIndex: number) {
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  function addBenefit() {
    const nextBenefit = benefitInput.trim().slice(0, MAX_BENEFIT_CHARS);

    if (!nextBenefit || keyBenefits.length >= MAX_BENEFITS) {
      return;
    }

    setKeyBenefits((current) => [...current, nextBenefit]);
    setBenefitInput("");
  }

  function handleBenefitKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addBenefit();
  }

  function addFaq() {
    const question = faqQuestion.trim().slice(0, MAX_FAQ_QUESTION_CHARS);
    const answer = faqAnswer.trim().slice(0, MAX_FAQ_ANSWER_CHARS);

    if (!question || !answer || faqs.length >= MAX_FAQS) {
      return;
    }

    setFaqs((current) => [...current, { question, answer }]);
    setFaqQuestion("");
    setFaqAnswer("");
  }

  function handleFaqKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addFaq();
  }

  async function uploadMedia(item: MediaItem, merchantId: string) {
    if (!item.file) {
      return item.url ?? item.previewUrl;
    }

    const path = `${merchantId}/${crypto.randomUUID()}-${cleanFileName(
      item.file.name,
    )}`;
    const { error } = await supabase.storage
      .from(PRODUCT_MEDIA_BUCKET)
      .upload(path, item.file);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!merchant || !canSave) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const photoUrls = await Promise.all(
        images.map((image) => uploadMedia(image, merchant.id)),
      );
      const videoUrl = video ? await uploadMedia(video, merchant.id) : null;
      const basePayload = {
        merchant_id: merchant.id,
        name: name.trim(),
        sale_price: Number(salePrice),
        original_price: originalPrice === "" ? null : Number(originalPrice),
        photo_urls: photoUrls,
        video_url: videoUrl,
        short_description: shortDescription.trim() || null,
        key_benefits: keyBenefits.map((benefit) => benefit.trim()).filter(Boolean),
        long_description: longDescription.trim() || null,
        in_stock: inStock,
      };
      const payload = {
        ...basePayload,
        faqs: faqs
          .map((faq) => ({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
          }))
          .filter((faq) => faq.question && faq.answer),
      };

      const saveProduct = (nextPayload: typeof basePayload | typeof payload) =>
        productId
          ? supabase
              .from("products")
              .update(nextPayload)
              .eq("id", productId)
              .eq("merchant_id", merchant.id)
          : supabase.from("products").insert(nextPayload);

      let { error } = await saveProduct(payload);

      if (isMissingFaqsColumn(error)) {
        if (payload.faqs.length) {
          throw new Error(
            "FAQs are not enabled in the database yet. Run the products.faqs SQL migration, then save again.",
          );
        }

        const fallback = await saveProduct(basePayload);
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      router.push("/dashboard?tab=products");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-[#111111]">
        <p className="text-sm font-medium text-[#888888]">Loading product...</p>
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFFFF] text-[#111111]">
      <header className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white">
        <div className="mx-auto flex h-[76px] w-full max-w-xl min-w-0 items-center gap-3 px-5">
          <Link
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#111111] transition hover:bg-[#F8F8F8]"
            href="/dashboard?tab=products"
            aria-label="Back to dashboard"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold">
            {isEditing ? "Edit product" : "Add product"}
          </h1>
        </div>
      </header>

      <form
        className="mx-auto grid w-full max-w-xl gap-5 overflow-x-hidden px-5 py-6"
        onSubmit={handleSubmit}
      >
        <section className="min-w-0 overflow-hidden">
          <h2 className="mb-3 text-[13px] font-semibold">
            Product Images
          </h2>
          <div className="-mx-1 flex max-w-full min-w-0 gap-3 overflow-x-auto px-1 pb-2">
            {images.length < MAX_IMAGES ? (
              <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#BBBBBB] bg-white text-center transition hover:border-[#111111]">
                <Plus aria-hidden="true" className="h-5 w-5 text-[#25D366]" strokeWidth={1.8} />
                <span className="mt-2 text-[10px] font-semibold uppercase text-[#888888]">
                  Add photo
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                />
              </label>
            ) : null}

            {images.map((image, index) => (
              <div
                className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F4F4F5] shadow-sm"
                draggable
                key={image.id}
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex !== null && draggedIndex !== index) {
                    moveImage(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
              >
                <img
                  className="h-full w-full object-cover"
                  src={image.previewUrl}
                  alt={name || "Product photo"}
                />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-[#25D366] px-2 py-0.5 text-[9px] font-bold text-white">
                    Main
                  </span>
                ) : null}
                <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#888888] shadow-sm">
                  <GripVertical aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
                <button
                  aria-label="Remove photo"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#111111] shadow-sm transition hover:text-[#EF4444]"
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.filter((item) => item.id !== image.id),
                    )
                  }
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#888888]">
            <GripVertical aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="min-w-0 flex-1">
              Drag items to reorder. First item is your cover. {images.length}/{MAX_IMAGES} images.
            </span>
          </p>
          {isCompressingImages ? (
            <p className="mt-2 text-xs font-semibold text-[#888888]">
              Compressing image...
            </p>
          ) : null}
        </section>

        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold">Product name</span>
          <input
            className="h-12 w-full rounded-2xl border-0 bg-[#F4F4F5] px-4 text-sm font-medium outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
            placeholder="e.g. Ankara Print Wrap Dress"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-[13px] font-semibold">Sale price</span>
            <input
              className="h-12 w-full rounded-2xl border-0 bg-[#F4F4F5] px-4 text-sm font-medium outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
              type="number"
              min="0"
              step="0.01"
              placeholder="18500"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              required
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-[13px] font-semibold">
              Original price <span className="text-[#888888]">(optional)</span>
            </span>
            <input
              className="h-12 w-full rounded-2xl border-0 bg-[#F4F4F5] px-4 text-sm font-medium outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
              type="number"
              min="0"
              step="0.01"
              placeholder="22000"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold">
            Short description
          </span>
          <textarea
            className="h-[96px] w-full resize-none overflow-y-auto rounded-2xl border-0 bg-[#F4F4F5] px-4 py-3.5 text-sm font-medium leading-6 outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
            maxLength={MAX_SHORT_DESCRIPTION_CHARS}
            placeholder="One or two sentences for the product callout box."
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
          />
          <span className="mt-1 block text-right text-[11px] font-medium text-[#888888]">
            {shortDescription.length}/{MAX_SHORT_DESCRIPTION_CHARS}
          </span>
        </label>

        <section className="min-w-0 overflow-hidden">
          <h2 className="mb-2 text-[13px] font-semibold">Key Benefits or Highlights</h2>
          <div className="grid gap-2">
            {keyBenefits.map((benefit, index) => (
              <div
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#F4F4F5] px-4 py-3.5 text-[13.5px] font-medium"
                key={`${benefit}-${index}`}
              >
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#BBBBBB]" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate">{benefit}</span>
                <button
                  aria-label="Remove benefit"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#BBBBBB] transition hover:text-[#EF4444]"
                  type="button"
                  onClick={() =>
                    setKeyBenefits((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
            <div className="flex min-w-0 gap-2">
              <input
                className="h-11 min-w-0 flex-1 rounded-2xl border-0 bg-[#F4F4F5] px-4 text-sm font-medium outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
                placeholder="Add a benefit and press Enter"
                maxLength={MAX_BENEFIT_CHARS}
                value={benefitInput}
                onChange={(event) => setBenefitInput(event.target.value)}
                onKeyDown={handleBenefitKeyDown}
                disabled={keyBenefits.length >= MAX_BENEFITS}
              />
              <button
                className="h-11 shrink-0 rounded-2xl bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={keyBenefits.length >= MAX_BENEFITS || !benefitInput.trim()}
                onClick={addBenefit}
              >
                Add
              </button>
            </div>
            <p className="text-xs font-medium text-[#888888]">
              {keyBenefits.length}/{MAX_BENEFITS} highlights added. {MAX_BENEFIT_CHARS} characters max each.
            </p>
          </div>
        </section>

        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold">
            Long description
          </span>
          <textarea
            className="min-h-36 w-full resize-none rounded-2xl border-0 bg-[#F4F4F5] px-4 py-3.5 text-sm font-medium leading-6 outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
            placeholder="Full product description. Separate paragraphs with a blank line."
            value={longDescription}
            onChange={(event) => setLongDescription(event.target.value)}
          />
        </label>

        <section className="min-w-0 overflow-hidden">
          <h2 className="mb-2 text-[13px] font-semibold">FAQs</h2>
          <div className="grid gap-2">
            {faqs.map((faq, index) => (
              <details
                className="group relative min-w-0 overflow-hidden rounded-2xl bg-[#F4F4F5] px-4 py-3.5 text-[13px] font-medium"
                key={`${faq.question}-${index}`}
              >
                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-3 pr-9">
                  <span className="shrink-0 font-bold text-[#111111]">Q</span>
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                    {faq.question}
                  </span>
                </summary>
                <button
                  aria-label="Remove FAQ"
                  className="absolute right-3 top-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#BBBBBB] transition hover:text-[#EF4444]"
                  type="button"
                  onClick={() =>
                    setFaqs((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <div className="mt-3 grid min-w-0 gap-2 border-t border-[#E5E5E5] pt-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="shrink-0 font-bold text-[#111111]">Q</span>
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {faq.question}
                    </p>
                  </div>
                  <div className="flex min-w-0 items-start gap-3 text-[#555555]">
                    <span className="shrink-0 font-bold text-[#888888]">A</span>
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </details>
            ))}
            <div className="grid gap-2">
              <input
                className="h-11 min-w-0 rounded-2xl border-0 bg-[#F4F4F5] px-4 text-sm font-medium outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
                placeholder="Question"
                maxLength={MAX_FAQ_QUESTION_CHARS}
                value={faqQuestion}
                onChange={(event) => setFaqQuestion(event.target.value)}
                onKeyDown={handleFaqKeyDown}
                disabled={faqs.length >= MAX_FAQS}
              />
              <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
                <textarea
                  className="min-h-20 min-w-0 resize-none rounded-2xl border-0 bg-[#F4F4F5] px-4 py-3 text-sm font-medium leading-6 outline-none transition placeholder:text-[#888888] focus:ring-2 focus:ring-[#111111]/10"
                  placeholder="Answer"
                  maxLength={MAX_FAQ_ANSWER_CHARS}
                  value={faqAnswer}
                  onChange={(event) => setFaqAnswer(event.target.value)}
                  disabled={faqs.length >= MAX_FAQS}
                />
                <button
                  className="h-11 shrink-0 rounded-2xl bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:self-start"
                  type="button"
                  disabled={
                    faqs.length >= MAX_FAQS ||
                    !faqQuestion.trim() ||
                    !faqAnswer.trim()
                  }
                  onClick={addFaq}
                >
                  Add
                </button>
              </div>
            </div>
            <p className="text-xs font-medium text-[#888888]">
              {faqs.length}/{MAX_FAQS} FAQs added. Questions {MAX_FAQ_QUESTION_CHARS} chars, answers {MAX_FAQ_ANSWER_CHARS} chars.
            </p>
          </div>
        </section>

        <label className="flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-white py-1">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold">In stock</span>
            <span className="block text-xs font-medium text-[#888888]">
              Turn off to show &quot;Out of stock&quot; on storefront
            </span>
          </span>
          <button
            aria-pressed={inStock}
            className={`flex h-5 w-10 shrink-0 items-center rounded-full p-0.5 transition ${
              inStock ? "bg-[#25D366]" : "bg-[#E5E5E5]"
            }`}
            type="button"
            onClick={() => setInStock((current) => !current)}
          >
            <span
              className={`h-4 w-4 rounded-full bg-white shadow transition ${
                inStock ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>

        <p className="flex min-w-0 items-start gap-2 text-[11px] font-medium leading-5 text-[#888888]">
          <Lightbulb
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#25D366]"
            strokeWidth={1.8}
          />
          <span className="min-w-0 flex-1">
            Tip: Products with at least 3 high-quality photos and clear
            benefits lists sell 45% faster.
          </span>
        </p>

        {message ? (
          <p className="rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 py-3.5 text-sm text-[#B91C1C]">
            {message}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pb-4">
          <Link
            className="flex items-center justify-center rounded-2xl border border-[#E5E5E5] px-5 py-[15px] text-sm font-semibold transition hover:bg-[#F8F8F8]"
            href="/dashboard?tab=products"
          >
            Cancel
          </Link>
          <button
            className="rounded-2xl bg-[#111111] px-5 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            type="submit"
            disabled={isSaving || isCompressingImages || !canSave}
          >
            {isSaving
              ? "Saving..."
              : isCompressingImages
                ? "Compressing..."
                : "Save product"}
          </button>
        </div>
      </form>
    </main>
  );
}
