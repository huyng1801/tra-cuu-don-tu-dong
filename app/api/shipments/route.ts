import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { shipmentFormSchema } from "@/features/shipments/schema";
import { createShipment, listShipments } from "@/features/shipments/repository";

export async function GET(request: Request) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const data = await listShipments(context.supabase, context.ownerUserId, searchParams);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Không tải được vận đơn.", 500);
  }
}

export async function POST(request: Request) {
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
    const data = await createShipment(context.supabase, context.ownerUserId, parsed.data);
    return jsonSuccess(data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tạo vận đơn thất bại.", 500);
  }
}
