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
        title="Them van don"
        description="Moi don chi gan toi da mot van don trong v1."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thong tin van don</CardTitle>
          <CardDescription>
            Link tra cuu se duoc sinh tu dong theo don vi van chuyen.
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

