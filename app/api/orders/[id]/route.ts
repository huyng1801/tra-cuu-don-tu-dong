import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { orderFormSchema } from "@/features/orders/schema";
import { deleteOrder, updateOrder } from "@/features/orders/repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = orderFormSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Du lieu khong hop le.", 400);
  }

  try {
    const { id } = await params;
    const data = await updateOrder(context.supabase, context.ownerUserId, id, parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Cap nhat don that bai.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await params;
    await deleteOrder(context.supabase, context.ownerUserId, id);
    return jsonSuccess({ id });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Xoa don that bai.", 500);
  }
}

