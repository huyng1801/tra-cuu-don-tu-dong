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
        title="Thêm khách hàng"
        description="Lưu thông tin khách hàng mới để theo dõi lịch sử tương tác và đơn mua."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
          <CardDescription>
            Có thể điền tay hoặc khởi tạo nhanh từ dữ liệu trích xuất từ sự kiện Facebook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm mode="create" defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
