import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/customer-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCustomerEventPrefill } from "@/features/facebook-events/repository";
import { requireCurrentUserProfile } from "@/features/auth/service";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const eventId = typeof params.facebookEventId === "string" ? params.facebookEventId : undefined;

  const defaultValues = eventId
    ? await (async () => {
        const [{ user }, supabase] = await Promise.all([
          requireCurrentUserProfile(),
          createSupabaseServerClient(),
        ]);
        return getCustomerEventPrefill(supabase, user.id, eventId);
      })()
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Them khach hang"
        description="Luu thong tin khach hang moi de theo doi lich su tuong tac va don mua."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thong tin khach hang</CardTitle>
          <CardDescription>
            Co the dien tay hoac khoi tao nhanh tu du lieu trich xuat tu Facebook event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm mode="create" defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}

