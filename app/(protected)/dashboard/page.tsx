import { Archive, CircleDollarSign, PackageCheck, Truck, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { getDashboardMetrics } from "@/features/dashboard/service";
import { DashboardOrdersChart } from "@/features/dashboard/orders-chart";

export default async function DashboardPage() {
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const metrics = await getDashboardMetrics(supabase, user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description="Theo dõi tổng quan khách hàng, đơn hàng và doanh thu tạm tính trong 7 ngày gần nhất."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng khách"
          value={metrics.totalCustomers.toString()}
          hint="Tất cả khách đã lưu"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Tổng đơn"
          value={metrics.totalOrders.toString()}
          hint={`${metrics.newOrders} đơn mới`}
          icon={<Archive className="size-5" />}
        />
        <StatCard
          label="Đang giao"
          value={metrics.shippingOrders.toString()}
          hint={`${metrics.completedOrders} đơn hoàn thành`}
          icon={<Truck className="size-5" />}
        />
        <StatCard
          label="Doanh thu"
          value={formatCurrency(metrics.estimatedRevenue)}
          hint={`${metrics.cancelledOrders} đơn hủy`}
          icon={<CircleDollarSign className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="surface-grid overflow-hidden">
          <CardHeader>
            <CardTitle>Nhịp độ đơn hàng 7 ngày</CardTitle>
            <CardDescription>
              Biểu đồ đơn giản theo ngày để nhìn nhanh xu hướng phát sinh đơn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOrdersChart data={metrics.dailySeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt nhanh</CardTitle>
            <CardDescription>Các con số chốt đơn cần nhìn trong ngày.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Đơn mới", metrics.newOrders],
              ["Đang giao", metrics.shippingOrders],
              ["Hoàn thành", metrics.completedOrders],
              ["Bị hủy", metrics.cancelledOrders],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-3xl border border-border/70 bg-accent/45 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <PackageCheck className="size-4" />
                  </span>
                  <p className="font-medium">{label}</p>
                </div>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
