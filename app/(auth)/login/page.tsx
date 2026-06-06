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
            Bảng điều khiển bán hàng đơn giản
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Quản lý khách, đơn và vận đơn trong một giao diện gọn nhẹ.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/78">
            CRM này tối ưu cho chủ shop nhỏ: lưu thông tin khách từ Facebook, tạo đơn
            nhanh, cập nhật vận đơn thủ công và xem tình hình bán hàng mỗi ngày.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Tổng quan doanh thu tạm tính",
              "Khách hàng + lịch sử đơn",
              "Webhook Facebook chính thức",
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
                <CardTitle>Đăng nhập chủ shop</CardTitle>
                <CardDescription>
                  Sử dụng tài khoản email và mật khẩu đã tạo trong hệ thống xác thực Supabase.
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
