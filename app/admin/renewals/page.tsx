"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserFacingError } from "@/app/components/userFacingErrors";
import { useI18n } from "@/app/i18n/LanguageProvider";

type ActiveMerchant = {
  id: string;
  business_name: string;
  slug: string;
  billing_cycle_months: 1 | 12;
  last_payment_date: string;
  expiry_date: string;
};

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function RenewalsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [merchants, setMerchants] = useState<ActiveMerchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRenewals() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      if (ADMIN_EMAIL && user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase.rpc("get_admin_renewals");

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage(getUserFacingError(error, "admin.renewals", t));
        setMerchants([]);
      } else {
        setMerchants((data ?? []) as ActiveMerchant[]);
      }

      setIsLoading(false);
    }

    loadRenewals();

    return () => {
      isMounted = false;
    };
  }, [router, t]);

  return (
      <main className="min-h-screen bg-white px-7 py-10 text-[#111111]">
        <section className="mx-auto w-full max-w-5xl rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-8">
          <div className="border-b border-[#E5E5E5] pb-6">
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAAAAA]">
            Admin
          </p>
          <h1 className="text-[24px] font-bold">Active merchant renewals</h1>
        </div>

        {isLoading ? (
              <p className="py-10 text-sm font-medium text-[#888888]">
            Loading renewals...
          </p>
        ) : null}

        {message ? (
              <p className="mt-6 rounded-xl border border-[#E5E5E5] bg-[#F4F4F5] px-4 py-3.5 text-sm text-[#B91C1C]">
            {message}
          </p>
        ) : null}

        {!isLoading && !merchants.length && !message ? (
              <p className="py-10 text-sm font-medium text-[#888888]">
            No active merchants with renewal dates.
          </p>
        ) : null}

        {merchants.length ? (
              <div className="divide-y divide-[#E5E5E5]">
            {merchants.map((merchant) => {
              return (
                <article
                  className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                  key={merchant.id}
                >
                  <div>
                    <h2 className="font-semibold">{merchant.business_name}</h2>
                      <p className="text-sm text-[#888888]">/store/{merchant.slug}</p>
                  </div>
                  <p className="text-sm">
                    {merchant.billing_cycle_months === 12 ? "Yearly" : "Monthly"}
                  </p>
                    <p className="text-sm text-[#888888]">
                    Paid{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(merchant.last_payment_date))}
                  </p>
                  <p className="font-semibold">
                    Expires{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(merchant.expiry_date))}
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
