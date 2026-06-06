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
    throw new Error("Phien dang nhap da het han.");
  }

  return { supabase, ownerUserId: user.id };
}

export async function createShipmentAction(input: ShipmentFormValues) {
  const parsed = shipmentFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
      shipmentId: undefined,
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    const shipment = await createShipment(supabase, ownerUserId, parsed.data);
    revalidatePath("/shipments");
    revalidatePath("/orders");

    return {
      success: true,
      message: "Da tao van don.",
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
      message: parsed.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const { supabase, ownerUserId } = await getCurrentOwnerUserId();
    await updateShipment(supabase, ownerUserId, id, parsed.data);
    revalidatePath("/shipments");
    revalidatePath(`/shipments/${id}`);
    revalidatePath("/orders");

    return {
      success: true,
      message: "Da cap nhat van don.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
