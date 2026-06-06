import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { orderFormSchema } from "@/features/orders/schema";
import { createOrder, listOrders } from "@/features/orders/repository";

export async function GET(request: Request) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const data = await listOrders(context.supabase, context.ownerUserId, searchParams);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Không tải được đơn hàng.", 500);
  }
}

export async function POST(request: Request) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = orderFormSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const data = await createOrder(context.supabase, context.ownerUserId, parsed.data);
    return jsonSuccess(data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tạo đơn thất bại.", 500);
  }
}
