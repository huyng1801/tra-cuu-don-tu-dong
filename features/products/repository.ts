import type { SupabaseClient } from "@supabase/supabase-js";

import {
  resolveLabelContentType,
  validateProductLabelFile,
} from "@/lib/product-label-upload";
import { getRange } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import {
  productFormSchema,
  productsQuerySchema,
  type ProductFormInput,
} from "@/features/products/schema";

export interface ProductListItem {
  id: string;
  name: string;
  sku_code: string;
  unit: string;
  default_unit_price: number;
  label_image_path: string | null;
  created_at: string;
}

export interface ProductPickerItem {
  id: string;
  name: string;
  sku_code: string;
  unit: string;
  default_unit_price: number;
  label_image_path: string | null;
}

export async function listProducts(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  query: Partial<Record<string, string | string[] | undefined>>,
) {
  const parsed = productsQuerySchema.parse(query);
  const { from, to } = getRange(parsed.page, parsed.pageSize);

  let request = supabase
    .from("products")
    .select("id,name,sku_code,unit,default_unit_price,label_image_path,created_at", {
      count: "exact",
    })
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (parsed.q) {
    request = request.or(
      `name.ilike.%${parsed.q}%,sku_code.ilike.%${parsed.q}%`,
    );
  }

  const { data, count, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as ProductListItem[],
    pagination: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / parsed.pageSize)),
    },
    q: parsed.q,
  };
}

export async function listProductsForPicker(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
) {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,sku_code,unit,default_unit_price,label_image_path")
    .eq("owner_user_id", ownerUserId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProductPickerItem[];
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
): Promise<Database["public"]["Tables"]["products"]["Row"]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Database["public"]["Tables"]["products"]["Row"];
}

export async function createProduct(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: ProductFormInput,
) {
  const values = productFormSchema.parse(input);
  const { data, error } = await supabase
    .from("products")
    .insert({
      owner_user_id: ownerUserId,
      ...values,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProduct(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
  input: ProductFormInput,
) {
  const values = productFormSchema.parse(input);
  const { data, error } = await supabase
    .from("products")
    .update(values)
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProductLabelPath(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
  labelImagePath: string | null,
) {
  const { data, error } = await supabase
    .from("products")
    .update({ label_image_path: labelImagePath })
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
) {
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", ownerUserId)
    .eq("product_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Không thể xóa sản phẩm đã được gắn vào đơn hàng.");
  }

  const product = await getProductById(supabase, ownerUserId, id);

  if (product.label_image_path) {
    const { error: storageError } = await supabase.storage
      .from("product-labels")
      .remove([product.label_image_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("owner_user_id", ownerUserId)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadProductLabel(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  productId: string,
  file: File,
) {
  const validationError = validateProductLabelFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${ownerUserId}/${productId}.${extension}`;
  const contentType = resolveLabelContentType(file);

  if (!contentType) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");
  }

  const { error: uploadError } = await supabase.storage
    .from("product-labels")
    .upload(path, file, { upsert: true, contentType });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return updateProductLabelPath(supabase, ownerUserId, productId, path);
}
