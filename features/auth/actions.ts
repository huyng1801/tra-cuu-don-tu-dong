"use server";

import { revalidatePath } from "next/cache";

import { loginSchema, profileSchema, type LoginInput, type ProfileInput } from "@/features/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu dang nhap khong hop le.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Dang nhap thanh cong.",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function updateProfileAction(input: ProfileInput) {
  const parsed = profileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Phien dang nhap da het han.",
    };
  }

  const { error } = await supabase
    .from("users")
    .update({
      full_name: parsed.data.full_name,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/settings");

  return {
    success: true,
    message: "Da cap nhat ten hien thi.",
  };
}

