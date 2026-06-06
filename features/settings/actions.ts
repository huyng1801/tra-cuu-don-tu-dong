"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { upsertShopSettings } from "@/features/settings/repository";
import { shopSettingsFormSchema, type ShopSettingsFormValues } from "@/features/settings/schema";

export async function updateShopSettingsAction(input: ShopSettingsFormValues) {
  const parsed = shopSettingsFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Phiên đăng nhập đã hết hạn.");
    }

    await upsertShopSettings(supabase, user.id, parsed.data);
    revalidatePath("/settings");

    return {
      success: true,
      message: "Đã lưu thông tin phiếu xuất kho.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
