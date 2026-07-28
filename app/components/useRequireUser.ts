"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useRequireUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser((currentUser) =>
        currentUser?.id === session.user.id ? currentUser : session.user,
      );
      setIsCheckingAuth((currentValue) =>
        currentValue ? false : currentValue,
      );
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setUser((currentUser) =>
        currentUser?.id === session.user.id ? currentUser : session.user,
      );
      setIsCheckingAuth((currentValue) =>
        currentValue ? false : currentValue,
      );
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, isCheckingAuth };
}
