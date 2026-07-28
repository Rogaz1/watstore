"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
        setMessage(error.message);
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
  }, [router]);

  return (
      <main className="min-h-screen bg-white px-6 py-10 text-[#1C1917]">
        <section className="mx-auto w-full max-w-5xl rounded-lg border border-[#E7E4DF] bg-white p-8 shadow-sm">
          <div className="border-b border-[#E7E4DF] pb-6">
            <p className="mb-2 text-sm font-medium uppercase text-[#78716C]">
            Admin
          </p>
          <h1 className="text-2xl font-semibold">Active merchant renewals</h1>
        </div>

        {isLoading ? (
              <p className="py-10 text-sm font-medium text-[#78716C]">
            Loading renewals...
          </p>
        ) : null}

        {message ? (
              <p className="mt-6 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
            {message}
          </p>
        ) : null}

        {!isLoading && !merchants.length && !message ? (
              <p className="py-10 text-sm font-medium text-[#78716C]">
            No active merchants with renewal dates.
          </p>
        ) : null}

        {merchants.length ? (
              <div className="divide-y divide-[#E7E4DF]">
            {merchants.map((merchant) => {
              return (
                <article
                  className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                  key={merchant.id}
                >
                  <div>
                    <h2 className="font-semibold">{merchant.business_name}</h2>
                      <p className="text-sm text-[#78716C]">/store/{merchant.slug}</p>
                  </div>
                  <p className="text-sm">
                    {merchant.billing_cycle_months === 12 ? "Yearly" : "Monthly"}
                  </p>
                    <p className="text-sm text-[#78716C]">
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
