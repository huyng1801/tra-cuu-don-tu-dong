import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CarrierBadge, ShippingStatusBadge } from "@/components/shared/status-badge";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { ShipmentForm } from "@/features/shipments/shipment-form";
import { getShipmentById } from "@/features/shipments/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);

  const [{ data: orders, error }, shipment] = await Promise.all([
    supabase
      .from("orders")
      .select("id,order_code,product_name")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    getShipmentById(supabase, user.id, shipmentId),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={shipment.tracking_code}
        description="Cập nhật mã tracking, đơn vị vận chuyển và trạng thái giao hàng."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa vận đơn</CardTitle>
            <CardDescription>Đồng bộ thủ công theo thông tin bạn thu thập được.</CardDescription>
          </CardHeader>
          <CardContent>
            <ShipmentForm
              mode="edit"
              shipmentId={shipment.id}
              orders={orders ?? []}
              defaultValues={{
                order_id: shipment.order_id,
                carrier: shipment.carrier as never,
                tracking_code: shipment.tracking_code,
                shipping_status: shipment.shipping_status as never,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt vận đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đơn vị</span>
              <CarrierBadge carrier={shipment.carrier as never} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <ShippingStatusBadge status={shipment.shipping_status as never} />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Link tra cứu</p>
              {shipment.tracking_url ? (
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {shipment.tracking_url}
                </a>
              ) : (
                <p>Chưa có link sẵn cho carrier này.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
