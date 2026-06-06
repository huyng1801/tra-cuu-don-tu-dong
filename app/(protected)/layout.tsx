import { ConfigurationNotice } from "@/components/shared/configuration-notice";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { hasSupabaseConfig } from "@/lib/env";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasSupabaseConfig()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <ConfigurationNotice />
      </div>
    );
  }

  const { profile } = await requireCurrentUserProfile();

  return (
    <SidebarShell
      profile={{
        email: profile.email,
        full_name: profile.full_name,
      }}
    >
      {children}
    </SidebarShell>
  );
}
