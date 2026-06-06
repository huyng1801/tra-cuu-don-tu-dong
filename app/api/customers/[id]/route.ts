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
    return jsonError(parsed.error.issues[0]?.message ?? "Du lieu khong hop le.", 400);
  }

  try {
    const { id } = await params;
    const data = await updateCustomer(context.supabase, context.ownerUserId, id, parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Cap nhat khach hang that bai.",
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
    return jsonError(error instanceof Error ? error.message : "Xoa khach hang that bai.", 500);
  }
}

