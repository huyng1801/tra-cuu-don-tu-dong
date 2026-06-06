import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { shipmentFormSchema } from "@/features/shipments/schema";
import { updateShipment } from "@/features/shipments/repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = shipmentFormSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const { id } = await params;
    const data = await updateShipment(context.supabase, context.ownerUserId, id, parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Cập nhật vận đơn thất bại.", 500);
  }
}
