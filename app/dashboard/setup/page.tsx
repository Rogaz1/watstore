"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Store,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMerchantForUser } from "@/app/components/merchantProfile";
import { useRequireUser } from "@/app/components/useRequireUser";

const LOGO_BUCKET = "merchant-logos";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export default function StoreSetupPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const userId = user?.id;
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const digitsOnlyWhatsapp = useMemo(
    () => whatsappNumber.replace(/\D/g, ""),
    [whatsappNumber],
  );
  const whatsappStartsWithZero = digitsOnlyWhatsapp.startsWith("0");
  const normalizedSlug = normalizeSlug(slug);
  const storePrefix =
    typeof window === "undefined"
      ? "/store/"
      : `${window.location.host}/store/`;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const currentUserId = userId;
    let isMounted = true;

    async function checkExistingMerchant() {
      const { data, error } = await getMerchantForUser(currentUserId);

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage(error.message);
        setIsCheckingProfile(false);
        return;
      }

      if (data) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingProfile(false);
    }

    checkExistingMerchant();

    return () => {
      isMounted = false;
    };
  }, [router, userId]);

  async function checkSlugAvailability() {
    if (!normalizedSlug) {
      setIsSlugAvailable(null);
      return false;
    }

    setIsCheckingSlug(true);
    setMessage("");

    const { data, error } = await supabase.rpc("is_slug_available", {
      requested_slug: normalizedSlug,
    });

    setIsCheckingSlug(false);

    if (error) {
      setMessage(error.message);
      setIsSlugAvailable(false);
      return false;
    }

    const available = Boolean(data);
    setIsSlugAvailable(available);

    if (!available) {
      setMessage("That Store URL is already taken. Try another slug.");
    }

    return available;
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : "");
    event.target.value = "";
  }

  async function uploadLogo(userId: string) {
    if (!logoFile) {
      return null;
    }

    const path = `${userId}/${crypto.randomUUID()}-${cleanFileName(
      logoFile.name,
    )}`;
    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, logoFile);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !businessName.trim() || !normalizedSlug || !digitsOnlyWhatsapp) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const slugAvailable = await checkSlugAvailability();

      if (!slugAvailable) {
        setIsSaving(false);
        return;
      }

      const logoUrl = await uploadLogo(user.id);
      const { error } = await supabase.from("merchants").insert({
        user_id: user.id,
        business_name: businessName.trim(),
        tagline: null,
        slug: normalizedSlug,
        whatsapp_number: digitsOnlyWhatsapp,
        logo_url: logoUrl,
        trial_start_date: new Date().toISOString(),
        subscription_status: "trial",
        billing_cycle_months: null,
        last_payment_date: null,
        subscription_expired_from: null,
      });

      if (error) {
        throw error;
      }

      router.replace("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create your store.",
      );
      setIsSaving(false);
    }
  }

  if (isCheckingAuth || isCheckingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1C1917]">
        <p className="text-sm font-medium text-[#78716C]">Checking setup...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFFFF] px-3 py-3 text-[#1C1917] sm:px-6 sm:py-8">
      <form
        className="mx-auto w-full min-w-0 max-w-full"
        style={{ maxWidth: "27rem" }}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 px-1 sm:mb-8">
          <p className="inline-flex items-center gap-1 text-[13px] font-bold">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Store Setup
          </p>
          <h1 className="mt-6 text-[27px] font-bold leading-tight sm:text-[30px]">
            Let&apos;s build your shop
          </h1>
          <p className="mt-2 max-w-[22rem] text-sm font-medium leading-6 text-[#78716C]">
            Just a few more details to get your storefront online and ready for
            orders.
          </p>
        </div>

        <div className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-5 overflow-hidden rounded-[10px] border border-[#E7E4DF] bg-white px-4 py-6 shadow-[0_10px_30px_rgba(28,25,23,0.05)] sm:px-6">
          <label className="block min-w-0 max-w-full">
            <span className="mb-2 block text-[13px] font-bold leading-none">
              Business Name
            </span>
            <span
              className="flex h-12 max-w-full items-center gap-2 rounded-[10px] border border-[#E7E4DF] bg-[#FAF9F7] px-3 text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10"
              style={{ boxSizing: "border-box", width: "100%" }}
            >
              <Store aria-hidden="true" className="h-4 w-4 shrink-0" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                placeholder="e.g. Lagos Fashion Hub"
                value={businessName}
                onChange={(event) => {
                  const nextBusinessName = event.target.value;
                  setBusinessName(nextBusinessName);
                  setIsSlugAvailable(null);

                  if (!hasEditedSlug) {
                    setSlug(normalizeSlug(nextBusinessName));
                  }
                }}
                required
              />
            </span>
          </label>

          <label className="block min-w-0 max-w-full">
            <span className="mb-2 block text-[13px] font-bold leading-none">
              Store URL
            </span>
            <div
              className="flex h-12 max-w-full overflow-hidden rounded-[10px] border border-[#E7E4DF] bg-[#FAF9F7] focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10"
              style={{ boxSizing: "border-box", width: "100%" }}
            >
              <span className="flex h-full shrink-0 items-center gap-2 border-r border-[#E7E4DF] bg-[#E7E4DF]/35 px-3 text-[12px] font-semibold text-[#78716C]">
                <LinkIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {storePrefix}
              </span>
              <input
                className="h-full min-w-0 flex-1 basis-0 bg-transparent px-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                placeholder="your-store-name"
                value={slug}
                onBlur={checkSlugAvailability}
                onChange={(event) => {
                  setHasEditedSlug(true);
                  setIsSlugAvailable(null);
                  setSlug(normalizeSlug(event.target.value));
                }}
                required
              />
            </div>
            {isCheckingSlug ? (
              <p className="mt-2 text-xs font-medium text-[#78716C]">
                Checking URL...
              </p>
            ) : null}
            {isSlugAvailable ? (
              <p className="mt-2 text-xs font-semibold text-[#1DA851]">
                /store/{normalizedSlug} is available.
              </p>
            ) : null}
            <p className="mt-2 text-xs font-medium leading-5 text-[#78716C]">
              This is your unique store link for customers.
            </p>
          </label>

          <label className="block min-w-0 max-w-full">
            <span className="mb-2 block text-[13px] font-bold leading-none">
              WhatsApp Number
            </span>
            <div
              className="flex h-12 max-w-full overflow-hidden rounded-[10px] border border-[#E7E4DF] bg-[#FAF9F7] focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10"
              style={{ boxSizing: "border-box", width: "100%" }}
            >
              <span className="flex h-full shrink-0 items-center gap-2 border-r border-[#E7E4DF] bg-[#E7E4DF]/35 px-3 text-sm font-bold text-[#1C1917]">
                <MessageSquare
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-[#1DA851]"
                />
                +233
              </span>
              <input
                className="h-full min-w-0 flex-1 basis-0 bg-transparent px-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                inputMode="tel"
                placeholder="501234567"
                value={whatsappNumber}
                onChange={(event) => setWhatsappNumber(event.target.value)}
                required
              />
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-[#78716C]">
              Customers will contact you here to complete orders.
            </p>
            {digitsOnlyWhatsapp ? (
              <p className="mt-2 text-xs font-medium text-[#78716C]">
                Saved as {digitsOnlyWhatsapp}
              </p>
            ) : null}
            {whatsappStartsWithZero ? (
              <p className="mt-2 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
                This starts with 0. Use a country code, like 1, 44, or 234,
                instead of a local leading zero.
              </p>
            ) : null}
          </label>

          <section className="min-w-0 max-w-full">
            <label className="block min-w-0 max-w-full">
              <span className="mb-2 block text-[13px] font-bold leading-none">
                Store Logo <span className="text-[#78716C]">(Optional)</span>
              </span>
              <span
                className="flex min-h-36 max-w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#E7E4DF] bg-[#FAF9F7] px-4 py-7 text-center transition hover:border-[#1C1917]"
                style={{ boxSizing: "border-box", width: "100%" }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E4DF] bg-white text-[#78716C]">
                  <ImageIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="mt-4 text-sm font-bold">Tap to upload logo</span>
                <span className="mt-1 text-xs font-semibold text-[#78716C]">
                  PNG, JPG up to 5MB
                </span>
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoChange}
              />
            </label>
            {logoPreviewUrl ? (
              <div className="mt-4 flex min-w-0 items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-20 w-20 shrink-0 rounded-md border border-[#E7E4DF] object-cover"
                  src={logoPreviewUrl}
                  alt="Store logo preview"
                />
                <button
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#B94A2C] hover:underline"
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreviewUrl("");
                  }}
                >
                  Remove logo
                </button>
              </div>
            ) : null}
          </section>
          {message ? (
            <p className="rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
              {message}
            </p>
          ) : null}

          <button
            className="mt-2 h-12 w-full rounded-full bg-[#1DA851] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(29,168,81,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#E7E4DF] disabled:text-[#78716C] disabled:shadow-none"
            style={{ boxSizing: "border-box", maxWidth: "100%" }}
            type="submit"
            disabled={
              isSaving ||
              isCheckingSlug ||
              !businessName.trim() ||
              !normalizedSlug ||
              !digitsOnlyWhatsapp
            }
          >
            {isSaving ? "Creating..." : "Create my store"}
          </button>
          <p className="text-center text-xs font-semibold text-[#78716C]">
            You can change these details later
          </p>
        </div>
      </form>
    </main>
  );
}
