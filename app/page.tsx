"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getPostAuthDestination } from "./components/merchantProfile";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    async function redirectFromRoot() {
      const resetHash = window.location.hash;

      if (
        resetHash.includes("access_token=") ||
        resetHash.includes("error_code=") ||
        resetHash.includes("type=recovery")
      ) {
        window.location.replace(`/reset-password${resetHash}`);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const destination = await getPostAuthDestination(session?.user ?? null);

      if (isActive) {
        router.replace(destination);
      }
    }

    redirectFromRoot().catch(() => {
      if (isActive) {
        router.replace("/login");
      }
    });

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
