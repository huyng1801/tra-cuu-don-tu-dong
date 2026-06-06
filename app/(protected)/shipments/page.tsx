import Link from "next/link";
import { Search } from "lucide-react";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CarrierBadge, ShippingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { CARRIER_LABELS, CARRIER_VALUES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { listShipments } from "@/features/shipments/repository";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const result = await listShipments(supabase, user.id, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vận đơn"
        description="Gắn mã vận đơn cho từng đơn và cập nhật trạng thái giao hàng thủ công."
        actionHref="/shipments/new"
        actionLabel="Thêm vận đơn"
      />

      <form className="grid gap-3 xl:grid-cols-[minmax(0,340px)_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tìm theo mã vận đơn"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
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
        <Button type="submit" variant="outline">
          Lọc vận đơn
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chưa có vận đơn"
          description="Khi có đơn cần giao, tạo vận đơn thủ công và gắn mã tracking tại đây."
        />
      ) : (
        <DataTable headers={["Đơn vị", "Mã vận đơn", "Đơn hàng", "Trạng thái", "Cập nhật", ""]}>
          {result.items.map((shipment) => (
            <DataRow key={shipment.id}>
              <DataCell>
                <CarrierBadge carrier={shipment.carrier as never} />
              </DataCell>
              <DataCell>
                <div className="space-y-2">
                  <p className="font-mono text-xs">{shipment.tracking_code}</p>
                  {shipment.tracking_url ? (
                    <a
                      href={shipment.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Mở link tra cứu
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Không có link sẵn</span>
                  )}
                </div>
              </DataCell>
              <DataCell>
                {shipment.order ? (
                  <div className="space-y-1">
                    <p className="font-semibold">{shipment.order.order_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.order.customer_name ?? "Khách chưa rõ"} -{" "}
                      {shipment.order.product_name}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Không tìm thấy đơn</span>
                )}
              </DataCell>
              <DataCell>
                <ShippingStatusBadge status={shipment.shipping_status as never} />
              </DataCell>
              <DataCell>{formatDateTime(shipment.created_at)}</DataCell>
              <DataCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/shipments/${shipment.id}`}>Chi tiết</Link>
                </Button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
