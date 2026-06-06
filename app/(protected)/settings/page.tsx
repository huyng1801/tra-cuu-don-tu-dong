import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/features/auth/profile-form";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { getShopSettings } from "@/features/settings/repository";
import { ShopSettingsForm } from "@/features/settings/shop-settings-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOptionalServerEnv } from "@/lib/env";

export default async function SettingsPage() {
  const { profile, user } = await requireCurrentUserProfile();
  const supabase = await createSupabaseServerClient();
  const shopSettings = await getShopSettings(supabase, user.id);
  const env = getOptionalServerEnv();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt"
        description="Cập nhật hồ sơ chủ shop và kiểm tra tình trạng cấu hình tích hợp."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ chủ shop</CardTitle>
              <CardDescription>
                V1 chỉ có một tài khoản chủ shop, đăng nhập bằng email và mật khẩu trong hệ thống xác thực Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm defaultValue={profile.full_name ?? "Chủ shop"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin phiếu xuất kho</CardTitle>
              <CardDescription>
                Cấu hình header công ty, MST và kho xuất để dùng khi xuất Excel từ trang chi tiết đơn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShopSettingsForm
                defaultValues={{
                  company_name: shopSettings.company_name,
                  company_address: shopSettings.company_address,
                  tax_code: shopSettings.tax_code,
                  document_code: shopSettings.document_code,
                  slip_number_prefix: shopSettings.slip_number_prefix,
                  warehouse_name: shopSettings.warehouse_name,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tình trạng tích hợp</CardTitle>
            <CardDescription>
              Các khóa bí mật vẫn được quản lý bằng file env và dashboard, không sửa trong giao diện.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { label: "URL Supabase", ready: Boolean(env.NEXT_PUBLIC_SUPABASE_URL) },
              {
                label: "Khóa ẩn danh Supabase",
                ready: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
              },
              {
                label: "Khóa vai trò dịch vụ Supabase",
                ready: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
              },
              {
                label: "Mã xác minh Facebook",
                ready: Boolean(env.FACEBOOK_VERIFY_TOKEN),
              },
              { label: "Mã ứng dụng Facebook", ready: Boolean(env.FACEBOOK_APP_ID) },
              {
                label: "Khóa bí mật ứng dụng Facebook",
                ready: Boolean(env.FACEBOOK_APP_SECRET),
              },
            ].map(({ label, ready }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-accent/45 px-4 py-3"
              >
                <span>{label}</span>
                <span className={ready ? "font-semibold text-success" : "font-semibold text-warning"}>
                  {ready ? "Đã cấu hình" : "Thiếu"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
