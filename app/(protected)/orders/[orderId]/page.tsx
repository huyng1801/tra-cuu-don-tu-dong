import { PageHeader } from "@/components/shared/page-header";
import { CarrierBadge, OrderStatusBadge, ShippingStatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { DeleteOrderButton } from "@/features/orders/delete-order-button";
import { OrderForm } from "@/features/orders/order-form";
import { getOrderById } from "@/features/orders/repository";
import { ShipmentForm } from "@/features/shipments/shipment-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);

  const [{ data: customers, error: customersError }, order] = await Promise.all([
    supabase
      .from("customers")
      .select("id,name,phone")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    getOrderById(supabase, user.id, orderId),
  ]);

  if (customersError) {
    throw new Error(customersError.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.order_code}
        description={`Sửa đơn hàng và vận đơn trên cùng một màn hình. Đơn được tạo lúc ${formatDateTime(order.created_at)}.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chỉnh sửa đơn hàng</CardTitle>
              <CardDescription>
                Cập nhật khách, sản phẩm, số lượng, giá bán và trạng thái chốt đơn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderForm
                mode="edit"
                orderId={order.id}
                customers={customers ?? []}
                defaultValues={{
                  customer_mode: "existing",
                  customer_id: order.customer_id,
                  product_name: order.product_name,
                  quantity: order.quantity,
                  unit_price: order.unit_price,
                  status: order.status,
                  note: order.note,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{order.shipment ? "Cập nhật vận đơn" : "Gắn vận đơn"}</CardTitle>
              <CardDescription>
                Mỗi đơn chỉ có một vận đơn. Bạn cập nhật mã vận đơn và trạng thái giao ngay tại đây.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentForm
                mode={order.shipment ? "edit" : "create"}
                shipmentId={order.shipment?.id}
                hideOrderField
                successPath={`/orders/${order.id}`}
                orders={[
                  {
                    id: order.id,
                    order_code: order.order_code,
                    product_name: order.product_name,
                  },
                ]}
                defaultValues={{
                  order_id: order.id,
                  carrier: (order.shipment?.carrier as never) ?? "ghn",
                  tracking_code: order.shipment?.tracking_code ?? "",
                  shipping_status: (order.shipment?.shipping_status as never) ?? "pending_pickup",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Khách hàng</span>
                <span className="text-right font-medium">{order.customer?.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Số điện thoại</span>
                <span className="text-right font-medium">{order.customer?.phone}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="text-right font-semibold">{formatCurrency(order.total_price)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Trạng thái đơn</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Đơn vị vận chuyển</span>
                {order.shipment ? (
                  <CarrierBadge carrier={order.shipment.carrier as never} />
                ) : (
                  <span className="text-muted-foreground">Chưa gắn</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Mã vận đơn</span>
                <span className="text-right font-mono text-xs">
                  {order.shipment?.tracking_code ?? "Chưa có"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Trạng thái giao</span>
                {order.shipment ? (
                  <ShippingStatusBadge status={order.shipment.shipping_status as never} />
                ) : (
                  <span className="text-muted-foreground">Chưa cập nhật</span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Liên kết tra cứu</p>
                {order.shipment?.tracking_url ? (
                  <a
                    href={order.shipment.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-primary hover:underline"
                  >
                    {order.shipment.tracking_url}
                  </a>
                ) : (
                  <p>Chưa có liên kết tra cứu cho đơn này.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
