"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function hasStoredSession() {
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) ?? "";
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        return true;
      }
    }
  } catch {}
  return false;
}

/**
 * Keeps what the old root route did: password-reset links that land on `/`
 * go to the reset screen, and signed-in merchants go straight to their
 * dashboard. Visitors without a session never load the auth code.
 */
export function AuthGate() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;

    if (
      hash.includes("access_token=") ||
      hash.includes("error_code=") ||
      hash.includes("type=recovery")
    ) {
      window.location.replace(`/reset-password${hash}`);
      return;
    }

    if (!hasStoredSession()) {
      return;
    }

    let isActive = true;

    async function redirectSignedInMerchant() {
      const [{ supabase }, { getPostAuthDestination }] = await Promise.all([
        import("@/lib/supabase"),
        import("@/app/components/merchantProfile"),
      ]);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      const destination = await getPostAuthDestination(session.user);

      if (isActive) {
        router.replace(destination);
      }
    }

    redirectSignedInMerchant().catch(() => {});

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
