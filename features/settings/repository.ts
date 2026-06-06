import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import {
  DEFAULT_SHOP_SETTINGS,
  shopSettingsFormSchema,
  type ShopSettings,
  type ShopSettingsFormInput,
} from "@/features/settings/schema";

export async function getShopSettings(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
): Promise<ShopSettings> {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data as ShopSettings;
  }

  return {
    owner_user_id: ownerUserId,
    ...DEFAULT_SHOP_SETTINGS,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertShopSettings(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: ShopSettingsFormInput,
) {
  const values = shopSettingsFormSchema.parse(input);
  const { data, error } = await supabase
    .from("shop_settings")
    .upsert(
      {
        owner_user_id: ownerUserId,
        ...values,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_user_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ShopSettings;
}
