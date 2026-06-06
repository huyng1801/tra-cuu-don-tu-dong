import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getApiAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    supabase,
    ownerUserId: user.id,
  };
}

