import { jsonError, jsonSuccess } from "@/lib/api";
import { getApiAuthContext } from "@/lib/api-auth";
import { getDashboardMetrics } from "@/features/dashboard/service";

export async function GET() {
  const context = await getApiAuthContext();

  if (!context) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const data = await getDashboardMetrics(context.supabase, context.ownerUserId);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Không tải được dashboard.", 500);
  }
}
