import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOptionalCurrentUser() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function ensureUserProfile(user: User) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Chủ shop",
      },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function requireCurrentUserProfile() {
  if (!hasSupabaseConfig()) {
    redirect("/login");
  }

  const user = await getOptionalCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureUserProfile(user);

  return { user, profile };
}
