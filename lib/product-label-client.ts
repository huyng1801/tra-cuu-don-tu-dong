"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  resolveLabelContentType,
  validateProductLabelFile,
} from "@/lib/product-label-upload";

export async function uploadProductLabelFromBrowser(productId: string, file: File) {
  const validationError = validateProductLabelFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Phiên đăng nhập đã hết hạn.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${productId}.${extension}`;
  const contentType = resolveLabelContentType(file);

  if (!contentType) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");
  }

  const { error } = await supabase.storage
    .from("product-labels")
    .upload(path, file, { upsert: true, contentType });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}
