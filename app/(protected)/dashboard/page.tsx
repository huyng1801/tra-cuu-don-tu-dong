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
        title="Dashboard"
        description="Theo doi tong quan khach hang, don hang va doanh thu tam tinh trong 7 ngay gan nhat."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tong khach"
          value={metrics.totalCustomers.toString()}
          hint="Tat ca khach da luu"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Tong don"
          value={metrics.totalOrders.toString()}
          hint={`${metrics.newOrders} don moi`}
          icon={<Archive className="size-5" />}
        />
        <StatCard
          label="Dang giao"
          value={metrics.shippingOrders.toString()}
          hint={`${metrics.completedOrders} don hoan thanh`}
          icon={<Truck className="size-5" />}
        />
        <StatCard
          label="Doanh thu"
          value={formatCurrency(metrics.estimatedRevenue)}
          hint={`${metrics.cancelledOrders} don huy`}
          icon={<CircleDollarSign className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="surface-grid overflow-hidden">
          <CardHeader>
            <CardTitle>Nhip do don hang 7 ngay</CardTitle>
            <CardDescription>
              Bieu do don gian theo ngay de nhin nhanh xu huong phat sinh don.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOrdersChart data={metrics.dailySeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tom tat nhanh</CardTitle>
            <CardDescription>Cac con so chot don can nhin trong ngay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Don moi", metrics.newOrders],
              ["Dang giao", metrics.shippingOrders],
              ["Hoan thanh", metrics.completedOrders],
              ["Bi huy", metrics.cancelledOrders],
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

