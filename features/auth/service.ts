import { cache } from "react";
import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const getCachedCurrentUserProfile = cache(async () => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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

  return { user, profile: data };
});

export async function getOptionalCurrentUser() {
  const result = await getCachedCurrentUserProfile();
  return result?.user ?? null;
}

export async function requireCurrentUserProfile() {
  if (!hasSupabaseConfig()) {
    redirect("/login");
  }

  const result = await getCachedCurrentUserProfile();
  if (!result) {
    redirect("/login");
  }

  return result;
}
