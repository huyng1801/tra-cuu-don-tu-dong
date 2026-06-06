import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurationNotice } from "@/components/shared/configuration-notice";
import { LoginForm } from "@/features/auth/login-form";
import { getOptionalCurrentUser } from "@/features/auth/service";
import { hasSupabaseConfig } from "@/lib/env";

export default async function LoginPage() {
  if (hasSupabaseConfig()) {
    const user = await getOptionalCurrentUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-border/70 bg-primary px-8 py-10 text-primary-foreground shadow-2xl shadow-primary/12">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary-foreground/70">
            Simple sales cockpit
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Quan ly khach, don va van don trong mot giao dien gon nhe.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/78">
            CRM nay toi uu cho chu shop nho: luu thong tin khach tu Facebook, tao don
            nhanh, cap nhat van don thu cong va xem tinh hinh ban hang moi ngay.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Dashboard doanh thu tam tinh",
              "Khach hang + lich su don",
              "Webhook Facebook chinh thuc",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/12 bg-white/8 px-4 py-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          {!hasSupabaseConfig() ? (
            <ConfigurationNotice />
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Dang nhap owner</CardTitle>
                <CardDescription>
                  Su dung tai khoan email/password da tao trong Supabase Auth.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

