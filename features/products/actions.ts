"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { productFormSchema, type ProductFormValues } from "@/features/products/schema";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  updateProductLabelPath,
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

export async function createProductAction(input: ProductFormValues) {
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

export async function updateProductAction(id: string, input: ProductFormValues) {
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

export async function saveProductLabelPathAction(productId: string, labelImagePath: string) {
  if (!labelImagePath.trim()) {
    return {
      success: false,
      message: "Đường dẫn ảnh nhãn không hợp lệ.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();

    if (!labelImagePath.startsWith(`${ownerUserId}/`)) {
      return {
        success: false,
        message: "Không thể lưu ảnh nhãn ngoài phạm vi tài khoản.",
      };
    }

    await updateProductLabelPath(supabase, ownerUserId, productId, labelImagePath);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/orders");

    return {
      success: true,
      message: "Đã lưu ảnh nhãn lên Supabase.",
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
