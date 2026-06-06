import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/features/auth/profile-form";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { getOptionalServerEnv } from "@/lib/env";

export default async function SettingsPage() {
  const { profile } = await requireCurrentUserProfile();
  const env = getOptionalServerEnv();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt"
        description="Cập nhật hồ sơ chủ shop và kiểm tra tình trạng cấu hình tích hợp."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ chủ shop</CardTitle>
            <CardDescription>
              V1 chỉ có một tài khoản chủ shop, đăng nhập bằng email/password Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultValue={profile.full_name ?? "Chủ shop"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tình trạng tích hợp</CardTitle>
            <CardDescription>
              Secret vẫn được quản lý bằng file env và dashboard, không sửa trong UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { label: "Supabase URL", ready: Boolean(env.NEXT_PUBLIC_SUPABASE_URL) },
              {
                label: "Supabase Anon Key",
                ready: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
              },
              {
                label: "Supabase Service Role",
                ready: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
              },
              {
                label: "Facebook Verify Token",
                ready: Boolean(env.FACEBOOK_VERIFY_TOKEN),
              },
              { label: "Facebook App ID", ready: Boolean(env.FACEBOOK_APP_ID) },
              {
                label: "Facebook App Secret",
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
