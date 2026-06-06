import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { ShipmentForm } from "@/features/shipments/shipment-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewShipmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,order_code,product_name")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm vận đơn"
        description="Mỗi đơn chỉ gắn tối đa một vận đơn trong v1."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin vận đơn</CardTitle>
          <CardDescription>
            Liên kết tra cứu sẽ được sinh tự động theo đơn vị vận chuyển.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentForm
            mode="create"
            orders={orders ?? []}
            defaultValues={{
              order_id: orderId,
              carrier: "ghn",
              shipping_status: "pending_pickup",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
