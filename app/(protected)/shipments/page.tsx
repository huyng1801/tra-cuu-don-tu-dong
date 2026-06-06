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
        title="Van don"
        description="Gan ma van don cho tung don va cap nhat trang thai giao hang thu cong."
        actionHref="/shipments/new"
        actionLabel="Them van don"
      />

      <form className="grid gap-3 xl:grid-cols-[minmax(0,340px)_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tim theo ma van don"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <select
          name="carrier"
          defaultValue={result.carrier ?? ""}
          className="h-11 rounded-2xl border border-border/80 bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Tat ca don vi</option>
          {CARRIER_VALUES.map((carrier) => (
            <option key={carrier} value={carrier}>
              {CARRIER_LABELS[carrier]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Loc van don
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chua co van don"
          description="Khi co don can giao, tao van don thu cong va gan ma tracking tai day."
        />
      ) : (
        <DataTable headers={["Don vi", "Ma van don", "Don hang", "Trang thai", "Cap nhat", ""]}>
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
                      Mo link tra cuu
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Khong co link san</span>
                  )}
                </div>
              </DataCell>
              <DataCell>
                {shipment.order ? (
                  <div className="space-y-1">
                    <p className="font-semibold">{shipment.order.order_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.order.customer_name ?? "Khach chua ro"} -{" "}
                      {shipment.order.product_name}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Khong tim thay don</span>
                )}
              </DataCell>
              <DataCell>
                <ShippingStatusBadge status={shipment.shipping_status as never} />
              </DataCell>
              <DataCell>{formatDateTime(shipment.created_at)}</DataCell>
              <DataCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/shipments/${shipment.id}`}>Chi tiet</Link>
                </Button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}

