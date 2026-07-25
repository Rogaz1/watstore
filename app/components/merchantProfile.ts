import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Merchant } from "./productTypes";

export async function getMerchantForUser(userId: string) {
  return supabase
    .from("merchants")
    .select("id,user_id,business_name,slug,whatsapp_number,logo_url")
    .eq("user_id", userId)
    .maybeSingle();
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
