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
import {
  CARRIER_LABELS,
  CARRIER_VALUES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_VALUES,
} from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/utils";
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
        title="Đơn hàng & vận đơn"
        description="Một bảng chung để theo dõi khách, đơn, mã vận đơn và trạng thái giao hàng cho từng đơn."
        actionHref="/orders/new"
        actionLabel="Tạo đơn hàng"
      />

      <form className="grid gap-3 xl:grid-cols-[minmax(0,320px)_200px_200px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tìm mã đơn, sản phẩm hoặc mã vận đơn"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <select
          name="status"
          defaultValue={result.status ?? ""}
          className="h-11 rounded-2xl border border-border/80 bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Tất cả trạng thái đơn</option>
          {ORDER_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          name="carrier"
          defaultValue={result.carrier ?? ""}
          className="h-11 rounded-2xl border border-border/80 bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Tất cả đơn vị</option>
          {CARRIER_VALUES.map((carrier) => (
            <option key={carrier} value={carrier}>
              {CARRIER_LABELS[carrier]}
            </option>
          ))}
        </select>
        <select
          name="shippingStatus"
          defaultValue={result.shippingStatus ?? ""}
          className="h-11 rounded-2xl border border-border/80 bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Tất cả trạng thái giao</option>
          {SHIPPING_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {SHIPPING_STATUS_LABELS[status]}
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
          description="Tạo đơn đầu tiên để bắt đầu theo dõi cả đơn hàng và vận đơn trên cùng một màn hình."
        />
      ) : (
        <DataTable
          headers={[
            "Đơn hàng",
            "Khách hàng",
            "Sản phẩm",
            "Trạng thái đơn",
            "Vận đơn",
            "Trạng thái giao",
            "Thao tác",
          ]}
        >
          {result.items.map((order) => (
            <DataRow key={order.id}>
              <DataCell>
                <div className="space-y-1">
                  <p className="font-semibold">{order.order_code}</p>
                  <p className="text-xs text-muted-foreground">
                    Tạo lúc {formatDateTime(order.created_at)}
                  </p>
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
                    {order.shipment.tracking_url ? (
                      <a
                        href={order.shipment.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Mở tra cứu
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chưa gắn vận đơn</span>
                )}
              </DataCell>
              <DataCell>
                {order.shipment ? (
                  <ShippingStatusBadge status={order.shipment.shipping_status as never} />
                ) : (
                  <span className="text-muted-foreground">Chưa cập nhật</span>
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
