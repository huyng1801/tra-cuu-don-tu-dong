import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { customerFormSchema } from "@/features/customers/schema";
import { createCustomer, listCustomers } from "@/features/customers/repository";

export async function GET(request: Request) {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const data = await listCustomers(context.supabase, context.ownerUserId, searchParams);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Khong tai duoc khach hang.", 500);
  }
}

export async function POST(request: Request) {
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
    const data = await createCustomer(context.supabase, context.ownerUserId, parsed.data);
    return jsonSuccess(data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tao khach hang that bai.", 500);
  }
}

