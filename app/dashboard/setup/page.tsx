"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isMounted = true;

    async function checkExistingMerchant() {
      const { data, error } = await getMerchantForUser(currentUser.id);

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
  }, [router, user]);

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
        slug: normalizedSlug,
        whatsapp_number: digitsOnlyWhatsapp,
        logo_url: logoUrl,
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
      <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 text-[#1f2933]">
        <p className="text-sm font-medium text-[#52606d]">Checking setup...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] px-6 py-12 text-[#1f2933]">
      <form
        className="mx-auto w-full max-w-2xl rounded-lg border border-[#d8d2c4] bg-white p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#5d6b5c]">
            Watstore
          </p>
          <h1 className="text-3xl font-semibold">Set up your store</h1>
        </div>

        <div className="grid gap-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Business Name
            </span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
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
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Store URL</span>
            <div className="flex overflow-hidden rounded-md border border-[#cfc7b7] bg-white focus-within:border-[#2f6f6c] focus-within:ring-2 focus-within:ring-[#2f6f6c]/20">
              <span className="flex h-12 items-center border-r border-[#cfc7b7] bg-[#f5f2ea] px-3 text-sm text-[#52606d]">
                /store/
              </span>
              <input
                className="h-12 min-w-0 flex-1 px-3 outline-none"
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
              <p className="mt-2 text-sm text-[#52606d]">Checking URL...</p>
            ) : null}
            {isSlugAvailable ? (
              <p className="mt-2 text-sm font-medium text-[#2f6f3a]">
                /store/{normalizedSlug} is available.
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              WhatsApp Number
            </span>
            <input
              className="h-12 w-full rounded-md border border-[#cfc7b7] px-3 outline-none transition focus:border-[#2f6f6c] focus:ring-2 focus:ring-[#2f6f6c]/20"
              inputMode="tel"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              required
            />
            {digitsOnlyWhatsapp ? (
              <p className="mt-2 text-sm text-[#52606d]">
                Saved as {digitsOnlyWhatsapp}
              </p>
            ) : null}
            {whatsappStartsWithZero ? (
              <p className="mt-2 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
                This starts with 0. Use a country code, like 1, 44, or 234,
                instead of a local leading zero.
              </p>
            ) : null}
          </label>

          <section>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Logo <span className="text-[#6b7280]">(optional)</span>
              </span>
              <input
                className="block w-full rounded-md border border-[#cfc7b7] bg-white px-3 py-3 text-sm"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
            {logoPreviewUrl ? (
              <div className="mt-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-20 w-20 rounded-md border border-[#d8d2c4] object-cover"
                  src={logoPreviewUrl}
                  alt="Store logo preview"
                />
                <button
                  className="text-sm font-medium text-[#8f2d20] hover:underline"
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
        </div>

        {message ? (
          <p className="mt-6 rounded-md border border-[#d99b8f] bg-[#fff4f1] px-3 py-2 text-sm text-[#8f2d20]">
            {message}
          </p>
        ) : null}

        <button
          className="mt-8 h-12 w-full rounded-md bg-[#2f6f6c] px-4 font-medium text-white transition hover:bg-[#285f5c] disabled:cursor-not-allowed disabled:bg-[#9fb9b7]"
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
      </form>
    </main>
  );
}
