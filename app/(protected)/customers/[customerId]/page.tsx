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
        description={`Tạo ngày ${formatDate(customer.created_at)} - theo dõi thông tin và lịch sử mua hàng của khách này.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật thông tin</CardTitle>
            <CardDescription>Chỉnh sửa địa chỉ, ghi chú và các thông tin liên hệ.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm mode="edit" customerId={customer.id} defaultValues={customer} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Chuyển sang luồng tạo đơn hoặc xóa khách hàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/orders/new?customerId=${customer.id}`}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Tạo đơn cho khách này
            </Link>
            <DeleteCustomerButton customerId={customer.id} />
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng"
          description="Khách hàng này chưa phát sinh đơn hàng nào. Bạn có thể tạo đơn mới ngay từ trang này."
        />
      ) : (
        <DataTable headers={["Mã đơn", "Sản phẩm", "Trạng thái", "Tổng tiền", ""]}>
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
                  Xem đơn
                </Link>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
