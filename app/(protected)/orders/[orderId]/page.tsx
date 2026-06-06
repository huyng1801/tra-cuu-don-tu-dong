import Link from "next/link";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import {
  CarrierBadge,
  OrderStatusBadge,
  ShippingStatusBadge,
} from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { DeleteOrderButton } from "@/features/orders/delete-order-button";
import { OrderForm } from "@/features/orders/order-form";
import { getOrderById } from "@/features/orders/repository";
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
        description={`Cập nhật thông tin đơn và theo dõi liên kết vận đơn. Tạo lúc ${formatDateTime(order.created_at)}.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa đơn hàng</CardTitle>
            <CardDescription>
              Trạng thái, tổng tiền và khách hàng liên quan được cập nhật tại đây.
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
            <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Khách hàng</span>
                <span className="font-medium">{order.customer?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="font-semibold">{formatCurrency(order.total_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vận đơn liên kết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.shipment ? (
                <DataTable headers={["Carrier", "Tracking", "Trang thai"]}>
                  <DataRow>
                    <DataCell>
                      <CarrierBadge carrier={order.shipment.carrier as never} />
                    </DataCell>
                    <DataCell>{order.shipment.tracking_code}</DataCell>
                    <DataCell>
                      <ShippingStatusBadge status={order.shipment.shipping_status as never} />
                    </DataCell>
                  </DataRow>
                </DataTable>
              ) : (
                <p className="text-sm text-muted-foreground">Đơn này chưa được gắn vận đơn.</p>
              )}
              <Link
                href={order.shipment ? `/shipments/${order.shipment.id}` : `/shipments/new?orderId=${order.id}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground"
              >
                {order.shipment ? "Cập nhật vận đơn" : "Gắn vận đơn"}
              </Link>
            </CardContent>
          </Card>

          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
