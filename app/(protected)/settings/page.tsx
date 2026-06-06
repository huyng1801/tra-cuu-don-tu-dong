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
        title="Cai dat"
        description="Cap nhat ho so owner va kiem tra tinh trang cau hinh tich hop."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Ho so owner</CardTitle>
            <CardDescription>
              V1 chi co mot tai khoan chu shop, dang nhap bang email/password Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultValue={profile.full_name ?? "Chu shop"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tinh trang tich hop</CardTitle>
            <CardDescription>
              Secret van duoc quan ly bang file env va dashboard, khong sua trong UI.
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
                  {ready ? "Da cau hinh" : "Thieu"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
