import Link from "next/link";
import { Search } from "lucide-react";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  CarrierBadge,
  OrderStatusBadge,
  ShippingStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VALUES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { DeleteOrderButton } from "@/features/orders/delete-order-button";
import { listOrders } from "@/features/orders/repository";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const result = await listOrders(supabase, user.id, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng"
        description="Quản lý danh sách đơn và tiến độ xử lý từ xác nhận đến giao thành công."
        actionHref="/orders/new"
        actionLabel="Tạo đơn hàng"
      />

      <form className="grid gap-3 xl:grid-cols-[minmax(0,360px)_200px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tìm mã đơn hoặc sản phẩm"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <select
          name="status"
          defaultValue={result.status ?? ""}
          className="h-11 rounded-2xl border border-border/80 bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Lọc danh sách
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng"
          description="Tạo đơn đầu tiên để bắt đầu theo dõi doanh thu và tiến độ giao hàng."
        />
      ) : (
        <DataTable headers={["Mã đơn", "Khách hàng", "Sản phẩm", "Trạng thái", "Vận đơn", ""]}>
          {result.items.map((order) => (
            <DataRow key={order.id}>
              <DataCell>
                <div className="space-y-1">
                  <p className="font-semibold">{order.order_code}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
              </DataCell>
              <DataCell>
                {order.customer ? (
                  <div className="space-y-1">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Không tìm thấy</span>
                )}
              </DataCell>
              <DataCell>
                <div className="space-y-1">
                  <p>{order.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.quantity} x {formatCurrency(order.unit_price)} ={" "}
                    {formatCurrency(order.total_price)}
                  </p>
                </div>
              </DataCell>
              <DataCell>
                <OrderStatusBadge status={order.status} />
              </DataCell>
              <DataCell>
                {order.shipment ? (
                  <div className="space-y-2">
                    <CarrierBadge carrier={order.shipment.carrier as never} />
                    <p className="font-mono text-xs">{order.shipment.tracking_code}</p>
                    <ShippingStatusBadge status={order.shipment.shipping_status as never} />
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chưa gắn</span>
                )}
              </DataCell>
              <DataCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders/${order.id}`}>Sửa</Link>
                  </Button>
                  <DeleteOrderButton
                    orderId={order.id}
                    label="Xóa"
                    redirectTo=""
                    size="sm"
                    variant="destructive"
                  />
                </div>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
