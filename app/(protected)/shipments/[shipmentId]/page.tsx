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
        description="Cap nhat ma tracking, don vi van chuyen va trang thai giao hang."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Chinh sua van don</CardTitle>
            <CardDescription>Dong bo thu cong theo thong tin ban thu thap duoc.</CardDescription>
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
            <CardTitle>Tom tat van don</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Don vi</span>
              <CarrierBadge carrier={shipment.carrier as never} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trang thai</span>
              <ShippingStatusBadge status={shipment.shipping_status as never} />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Link tra cuu</p>
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
                <p>Chua co link san cho carrier nay.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
