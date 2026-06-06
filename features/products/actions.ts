"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { productFormSchema, type ProductFormValues } from "@/features/products/schema";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductLabel,
} from "@/features/products/repository";

async function getCurrentOwnerUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Phiên đăng nhập đã hết hạn.");
  }

  return { supabase, ownerUserId: user.id };
}

export async function createProductAction(input: ProductFormValues, labelFile?: File | null) {
  const parsed = productFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      productId: undefined,
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    const product = await createProduct(supabase, ownerUserId, parsed.data);

    if (labelFile && labelFile.size > 0) {
      await uploadProductLabel(supabase, ownerUserId, product.id, labelFile);
    }

    revalidatePath("/products");
    revalidatePath("/orders");

    return {
      success: true,
      message: "Đã tạo sản phẩm mới.",
      productId: product.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
      productId: undefined,
    };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductFormValues,
  labelFile?: File | null,
) {
  const parsed = productFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateProduct(supabase, ownerUserId, id, parsed.data);

    if (labelFile && labelFile.size > 0) {
      await uploadProductLabel(supabase, ownerUserId, id, labelFile);
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/orders");

    return {
      success: true,
      message: "Đã cập nhật sản phẩm.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await deleteProduct(supabase, ownerUserId, id);
    revalidatePath("/products");

    return {
      success: true,
      message: "Đã xóa sản phẩm.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
