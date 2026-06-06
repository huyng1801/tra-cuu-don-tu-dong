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
    throw new Error("Phien dang nhap da het han.");
  }

  return { supabase, ownerUserId: user.id };
}

export async function createCustomerAction(input: CustomerFormValues) {
  const parsed = customerFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
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
      message: "Da tao khach hang moi.",
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
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateCustomer(supabase, ownerUserId, id, parsed.data);
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);

    return {
      success: true,
      message: "Da cap nhat khach hang.",
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
      message: "Da xoa khach hang.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
