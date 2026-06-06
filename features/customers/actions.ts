"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { customerFormSchema, type CustomerFormValues } from "@/features/customers/schema";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/features/customers/repository";

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

export async function createCustomerAction(input: CustomerFormValues) {
  const parsed = customerFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      customerId: undefined,
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    const customer = await createCustomer(supabase, ownerUserId, parsed.data);
    revalidatePath("/customers");
    revalidatePath("/orders");

    return {
      success: true,
      message: "Đã tạo khách hàng mới.",
      customerId: customer.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
      customerId: undefined,
    };
  }
}

export async function updateCustomerAction(id: string, input: CustomerFormValues) {
  const parsed = customerFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateCustomer(supabase, ownerUserId, id, parsed.data);
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);

    return {
      success: true,
      message: "Đã cập nhật khách hàng.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await deleteCustomer(supabase, ownerUserId, id);
    revalidatePath("/customers");

    return {
      success: true,
      message: "Đã xóa khách hàng.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
