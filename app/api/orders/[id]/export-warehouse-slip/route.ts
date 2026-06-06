import { getApiAuthContext } from "@/lib/api-auth";
import { jsonError } from "@/lib/api";
import { getOrderById } from "@/features/orders/repository";
import {
  buildWarehouseSlipBuffer,
  buildWarehouseSlipFilename,
} from "@/features/orders/export-warehouse-slip";
import { getShopSettings } from "@/features/settings/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const auth = await getApiAuthContext();

    if (!auth) {
      return jsonError("Phiên đăng nhập đã hết hạn.", 401);
    }

    const { supabase, ownerUserId } = auth;
    const [order, settings] = await Promise.all([
      getOrderById(supabase, ownerUserId, id),
      getShopSettings(supabase, ownerUserId),
    ]);

    const buffer = await buildWarehouseSlipBuffer(
      {
        order_code: order.order_code,
        product_name: order.product_name,
        quantity: order.quantity,
        unit_price: order.unit_price,
        total_price: order.total_price,
        created_at: order.created_at,
        customer: order.customer,
        product: order.product,
      },
      settings,
    );

    const filename = buildWarehouseSlipFilename({
      order_code: order.order_code,
      product_name: order.product_name,
      quantity: order.quantity,
      unit_price: order.unit_price,
      total_price: order.total_price,
      created_at: order.created_at,
      customer: order.customer,
    });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Không thể xuất phiếu.", 400);
  }
}
