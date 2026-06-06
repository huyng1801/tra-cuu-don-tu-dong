import Link from "next/link";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { DeleteCustomerButton } from "@/features/customers/delete-customer-button";
import { CustomerForm } from "@/features/customers/customer-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { getCustomerById } from "@/features/customers/repository";
import { listOrdersForCustomer } from "@/features/orders/repository";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const [customer, orders] = await Promise.all([
    getCustomerById(supabase, user.id, customerId),
    listOrdersForCustomer(supabase, user.id, customerId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`Tao ngay ${formatDate(customer.created_at)} - theo doi thong tin va lich su mua hang cua khach nay.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Cap nhat thong tin</CardTitle>
            <CardDescription>Chinh sua dia chi, ghi chu va cac thong tin lien he.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm mode="edit" customerId={customer.id} defaultValues={customer} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thao tac nhanh</CardTitle>
            <CardDescription>Chuyen sang luong tao don hoac xoa khach hang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/orders/new?customerId=${customer.id}`}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Tao don cho khach nay
            </Link>
            <DeleteCustomerButton customerId={customer.id} />
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Chua co don hang"
          description="Khach hang nay chua phat sinh don hang nao. Ban co the tao don moi ngay tu trang nay."
        />
      ) : (
        <DataTable headers={["Ma don", "San pham", "Trang thai", "Tong tien", ""]}>
          {orders.map((order) => (
            <DataRow key={order.id}>
              <DataCell>{order.order_code}</DataCell>
              <DataCell>{order.product_name}</DataCell>
              <DataCell>
                <OrderStatusBadge status={order.status} />
              </DataCell>
              <DataCell>{formatCurrency(order.total_price)}</DataCell>
              <DataCell className="text-right">
                <Link href={`/orders/${order.id}`} className="text-primary hover:underline">
                  Xem don
                </Link>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
