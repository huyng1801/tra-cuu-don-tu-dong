import { getSupabaseClientEnv } from "@/lib/env";

export function getProductLabelUrl(labelImagePath?: string | null) {
  if (!labelImagePath) {
    return null;
  }

  const env = getSupabaseClientEnv();

  if (!env) {
    return null;
  }

  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-labels/${labelImagePath}`;
}
