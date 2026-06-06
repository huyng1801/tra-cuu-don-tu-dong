import Link from "next/link";
import { Search } from "lucide-react";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { listCustomers } from "@/features/customers/repository";
import { requireCurrentUserProfile } from "@/features/auth/service";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const result = await listCustomers(supabase, user.id, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khach hang"
        description="Theo doi thong tin khach va lich su mua hang tu mot giao dien don gian."
        actionHref="/customers/new"
        actionLabel="Them khach hang"
      />

      <form className="grid gap-3 md:max-w-md md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tim theo ten hoac so dien thoai"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <Button type="submit" variant="outline">
          Tim kiem
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chua co khach hang"
          description="Bat dau bang viec tao khach hang moi, hoac dieu chinh bo loc tim kiem."
        />
      ) : (
        <DataTable headers={["Ten", "So dien thoai", "Facebook", "Ngay tao", ""]}>
          {result.items.map((customer) => (
            <DataRow key={customer.id}>
              <DataCell>
                <div className="space-y-1">
                  <p className="font-semibold">{customer.name}</p>
                  <Badge variant="muted">ID rut gon: {customer.id.slice(0, 8)}</Badge>
                </div>
              </DataCell>
              <DataCell>{customer.phone}</DataCell>
              <DataCell>
                {customer.facebook_url ? (
                  <a
                    href={customer.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Xem profile
                  </a>
                ) : (
                  <span className="text-muted-foreground">Chua co</span>
                )}
              </DataCell>
              <DataCell>{formatDate(customer.created_at)}</DataCell>
              <DataCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/customers/${customer.id}`}>Chi tiet</Link>
                </Button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Trang {result.pagination.page}/{result.pagination.totalPages} - {result.pagination.total} khach
          hang
        </p>
        <div className="flex gap-2">
          {result.pagination.page > 1 ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/customers?page=${result.pagination.page - 1}&q=${result.q}`}>
                Trang truoc
              </Link>
            </Button>
          ) : null}
          {result.pagination.page < result.pagination.totalPages ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/customers?page=${result.pagination.page + 1}&q=${result.q}`}>
                Trang sau
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
