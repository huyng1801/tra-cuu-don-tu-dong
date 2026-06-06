import { redirect } from "next/navigation";

import { requireCurrentUserProfile } from "@/features/auth/service";
import { getShipmentById } from "@/features/shipments/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  let orderId: string | null = null;

  try {
    const [{ user }, supabase] = await Promise.all([
      requireCurrentUserProfile(),
      createSupabaseServerClient(),
    ]);
    const shipment = await getShipmentById(supabase, user.id, shipmentId);
    orderId = shipment.order_id;
  } catch {
    orderId = null;
  }

  redirect(orderId ? `/orders/${orderId}` : "/orders");
}
