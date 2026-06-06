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
        title="Khách hàng"
        description="Theo dõi thông tin khách và lịch sử mua hàng từ một giao diện đơn giản."
        actionHref="/customers/new"
        actionLabel="Thêm khách hàng"
      />

      <form className="grid gap-3 md:max-w-md md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tìm theo tên hoặc số điện thoại"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chưa có khách hàng"
          description="Bắt đầu bằng việc tạo khách hàng mới, hoặc điều chỉnh bộ lọc tìm kiếm."
        />
      ) : (
        <DataTable headers={["Tên", "Số điện thoại", "Facebook", "Ngày tạo", ""]}>
          {result.items.map((customer) => (
            <DataRow key={customer.id}>
              <DataCell>
                <div className="space-y-1">
                  <p className="font-semibold">{customer.name}</p>
                  <Badge variant="muted">ID rút gọn: {customer.id.slice(0, 8)}</Badge>
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
                  <span className="text-muted-foreground">Chưa có</span>
                )}
              </DataCell>
              <DataCell>{formatDate(customer.created_at)}</DataCell>
              <DataCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/customers/${customer.id}`}>Chi tiết</Link>
                </Button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Trang {result.pagination.page}/{result.pagination.totalPages} - {result.pagination.total} khách
          hàng
        </p>
        <div className="flex gap-2">
          {result.pagination.page > 1 ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/customers?page=${result.pagination.page - 1}&q=${result.q}`}>
                Trang trước
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
