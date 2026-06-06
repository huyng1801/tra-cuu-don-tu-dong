"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";
import { shipmentFormSchema, type ShipmentFormValues } from "@/features/shipments/schema";
import { createShipment, updateShipment } from "@/features/shipments/repository";

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

export async function createShipmentAction(input: ShipmentFormValues) {
  const parsed = shipmentFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      shipmentId: undefined,
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    const shipment = await createShipment(supabase, ownerUserId, parsed.data);
    revalidatePath("/shipments");
    revalidatePath("/orders");
    revalidatePath(`/orders/${parsed.data.order_id}`);

    return {
      success: true,
      message: "Đã tạo vận đơn.",
      shipmentId: shipment.id,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
      shipmentId: undefined,
    };
  }
}

export async function updateShipmentAction(id: string, input: ShipmentFormValues) {
  const parsed = shipmentFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateShipment(supabase, ownerUserId, id, parsed.data);
    revalidatePath("/shipments");
    revalidatePath(`/shipments/${id}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${parsed.data.order_id}`);

    return {
      success: true,
      message: "Đã cập nhật vận đơn.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
