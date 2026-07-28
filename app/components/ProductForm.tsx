"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExpiredAccessScreen } from "./ExpiredAccessScreen";
import { getMerchantForUser } from "./merchantProfile";
import { Merchant, Product } from "./productTypes";
import {
  getSubscriptionAccess,
  refreshMerchantSubscription,
} from "./subscription";
import { useRequireUser } from "./useRequireUser";

const PRODUCT_MEDIA_BUCKET = "product-media";
const MAX_BENEFITS = 5;

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
  const [inStock, setInStock] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isSaving, setIsSaving] = useState(false);
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

      const { data: product, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("id", productId)
        .eq("merchant_id", refreshedMerchant.id)
        .single();

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
        (loadedProduct.photo_urls ?? []).map((url) => ({
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
      setKeyBenefits((loadedProduct.key_benefits ?? []).filter(Boolean).slice(0, MAX_BENEFITS));
      setLongDescription(loadedProduct.long_description ?? "");
      setInStock(loadedProduct.in_stock);
      setIsLoading(false);
    }

    loadMerchantAndProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, router, userId]);

  function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setImages((current) => [...current, ...files.map(makeMediaItem)]);
    event.target.value = "";
  }

  function handleVideoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setVideo(file ? makeMediaItem(file) : null);
    event.target.value = "";
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
    const nextBenefit = benefitInput.trim();

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
      const payload = {
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

      const request = productId
        ? supabase
            .from("products")
            .update(payload)
            .eq("id", productId)
            .eq("merchant_id", merchant.id)
        : supabase.from("products").insert(payload);

      const { error } = await request;

      if (error) {
        throw error;
      }

      router.push("/dashboard");
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-[#1C1917]">
        <p className="text-sm font-medium text-[#78716C]">Loading product...</p>
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
    <main className="min-h-screen bg-[#FFFFFF] text-[#1C1917]">
      <header className="sticky top-0 z-10 border-b border-[#E7E4DF] bg-white">
        <div className="mx-auto flex w-full max-w-5xl min-w-0 items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase text-[#78716C]">
              Watstore
            </p>
            <h1 className="truncate text-2xl font-semibold">
              {isEditing ? "Edit Product" : "Add Product"}
            </h1>
          </div>
          <Link
            className="shrink-0 rounded-md border border-[#E7E4DF] px-4 py-2 text-sm font-medium transition hover:border-[#1C1917]"
            href="/dashboard"
          >
            Cancel
          </Link>
        </div>
      </header>

      <form
        className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Name</span>
          <input
            className="h-12 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Sale price</span>
            <input
              className="h-12 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Original price <span className="text-[#78716C]">(optional)</span>
            </span>
            <input
              className="h-12 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
            />
          </label>
        </div>

        <section className="rounded-lg border border-[#E7E4DF] bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Photo/video upload</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Product photos
              </span>
              <input
                className="block w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3 text-sm"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFiles}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Product video <span className="text-[#78716C]">(optional)</span>
              </span>
              <input
                className="block w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3 text-sm"
                type="file"
                accept="video/*"
                onChange={handleVideoFile}
              />
            </label>
          </div>

          {images.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <div
                  className="group relative aspect-square overflow-hidden rounded-md border border-[#E7E4DF] bg-[#FAF9F7]"
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
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#1C1917]/80 px-2 py-1 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  ) : null}
                  <div className="absolute inset-x-2 top-2 flex justify-end opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      aria-label="Remove photo"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-lg leading-none text-[#B94A2C] shadow-sm"
                      type="button"
                      onClick={() =>
                        setImages((current) =>
                          current.filter((item) => item.id !== image.id),
                        )
                      }
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {images.length ? (
            <p className="mt-3 text-xs text-[#78716C]">
              Drag to reorder. First photo is cover.
            </p>
          ) : null}

          {video ? (
            <div className="mt-5 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] p-3">
              <video
                className="max-h-64 w-full rounded-md bg-black"
                controls
                src={video.previewUrl}
              />
              <button
                className="mt-3 text-sm font-medium text-[#B94A2C] hover:underline"
                type="button"
                onClick={() => setVideo(null)}
              >
                Remove video
              </button>
            </div>
          ) : null}
        </section>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Short description
          </span>
          <textarea
            className="min-h-28 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
          />
        </label>

        <section>
          <h2 className="mb-2 text-sm font-medium">Key benefits</h2>
          <div className="grid gap-2">
            {keyBenefits.map((benefit, index) => (
              <div
                className="flex min-w-0 items-center gap-3 rounded-md bg-[#FAF9F7] px-3 py-3 text-sm"
                key={`${benefit}-${index}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1DA851] text-xs font-bold text-white">
                  ✓
                </span>
                <span className="min-w-0 flex-1">{benefit}</span>
                <button
                  aria-label="Remove benefit"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[#78716C] hover:text-[#B94A2C]"
                  type="button"
                  onClick={() =>
                    setKeyBenefits((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  x
                </button>
              </div>
            ))}
            <div className="flex min-w-0 gap-2">
              <input
                className="h-11 min-w-0 flex-1 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
                placeholder="Add a benefit and press Enter"
                value={benefitInput}
                onChange={(event) => setBenefitInput(event.target.value)}
                onKeyDown={handleBenefitKeyDown}
                disabled={keyBenefits.length >= MAX_BENEFITS}
              />
              <button
                className="h-11 shrink-0 rounded-md bg-[#1C1917] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#78716C]"
                type="button"
                disabled={keyBenefits.length >= MAX_BENEFITS || !benefitInput.trim()}
                onClick={addBenefit}
              >
                Add
              </button>
            </div>
            <p className="text-xs text-[#78716C]">
              {keyBenefits.length}/{MAX_BENEFITS} benefits added.
            </p>
          </div>
        </section>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Long description
          </span>
          <textarea
            className="min-h-44 w-full rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3 outline-none transition focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
            value={longDescription}
            onChange={(event) => setLongDescription(event.target.value)}
          />
        </label>

        <label className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-[#E7E4DF] bg-white p-5">
          <span className="min-w-0 flex-1">
            <span className="block font-medium">In stock</span>
            <span className="block text-sm text-[#78716C]">
              Available for customers once storefront pages are added.
            </span>
          </span>
          <input
            className="h-5 w-5 shrink-0 accent-[#1C1917]"
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
          />
        </label>

        {message ? (
          <p className="rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            className="flex h-12 items-center justify-center rounded-md border border-[#E7E4DF] px-5 font-medium transition hover:border-[#1C1917]"
            href="/dashboard"
          >
            Cancel
          </Link>
          <button
            className="h-12 rounded-md bg-[#1C1917] px-5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#78716C]"
            type="submit"
            disabled={isSaving || !canSave}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </main>
  );
}
