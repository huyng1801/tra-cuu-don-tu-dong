import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { OrderForm } from "@/features/orders/order-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderEventPrefill } from "@/features/facebook-events/repository";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const customerId = typeof params.customerId === "string" ? params.customerId : "";
  const facebookEventId =
    typeof params.facebookEventId === "string" ? params.facebookEventId : undefined;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);

  const [{ data: customers, error: customersError }, eventPrefill] = await Promise.all([
    supabase
      .from("customers")
      .select("id,name,phone")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    facebookEventId ? getOrderEventPrefill(supabase, user.id, facebookEventId) : undefined,
  ]);

  if (customersError) {
    throw new Error(customersError.message);
  }

  const defaultValues = eventPrefill
    ? {
        customer_mode: "new" as const,
        customer_name: eventPrefill.customer_name ?? "",
        customer_phone: eventPrefill.customer_phone ?? "",
        product_name: "Don tu Facebook event",
        note: eventPrefill.note,
      }
    : {
        customer_mode: customerId ? ("existing" as const) : ("existing" as const),
        customer_id: customerId,
        product_name: "",
        quantity: 1,
        unit_price: 0,
        status: "new" as const,
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tao don hang"
        description="Chon khach co san hoac tao nhanh khach moi ngay trong form don."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thong tin don hang</CardTitle>
          <CardDescription>
            Tong tien duoc tinh tu dong tu so luong va gia ban.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm mode="create" customers={customers ?? []} defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}

