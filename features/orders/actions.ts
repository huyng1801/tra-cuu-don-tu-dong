"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { orderFormSchema, type OrderFormValues } from "@/features/orders/schema";
import { createOrder, deleteOrder, updateOrder } from "@/features/orders/repository";

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

export async function createOrderAction(input: OrderFormValues) {
  const parsed = orderFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
      orderId: undefined,
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    const order = await createOrder(supabase, ownerUserId, parsed.data);
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/shipments");
    revalidatePath("/customers");

    return {
      success: true,
      message: "Da tao don hang.",
      orderId: order.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
      orderId: undefined,
    };
  }
}

export async function updateOrderAction(id: string, input: OrderFormValues) {
  const parsed = orderFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateOrder(supabase, ownerUserId, id, parsed.data);
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/shipments");
    revalidatePath("/customers");

    return {
      success: true,
      message: "Da cap nhat don hang.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteOrderAction(id: string) {
  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await deleteOrder(supabase, ownerUserId, id);
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/shipments");

    return {
      success: true,
      message: "Da xoa don hang.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
