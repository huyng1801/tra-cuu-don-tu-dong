import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { customerFormSchema } from "@/features/customers/schema";
import { deleteCustomer, updateCustomer } from "@/features/customers/repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = customerFormSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.", 400);
  }

  try {
    const { id } = await params;
    const data = await updateCustomer(context.supabase, context.ownerUserId, id, parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Cập nhật khách hàng thất bại.",
      500,
    );
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
    await deleteCustomer(context.supabase, context.ownerUserId, id);
    return jsonSuccess({ id });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Xóa khách hàng thất bại.", 500);
  }
}
