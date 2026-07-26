import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Merchant } from "./productTypes";

export async function getMerchantForUser(userId: string) {
  void userId;

  const response = await supabase.rpc("get_current_merchant_profile").maybeSingle();

  return {
    ...response,
    data: response.data as Merchant | null,
  };
}

export async function getPostAuthDestination(user: User | null) {
  if (!user) {
    return "/login";
  }

  const { data, error } = await getMerchantForUser(user.id);

  if (error) {
    throw error;
  }

  return data ? "/dashboard" : "/dashboard/setup";
}

export type MerchantProfile = Merchant;
