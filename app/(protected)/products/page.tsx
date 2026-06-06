import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

import { DataCell, DataRow, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { listProducts } from "@/features/products/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProductLabelUrl } from "@/lib/product-labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const result = await listProducts(supabase, user.id, params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sản phẩm & nhãn"
        description="Quản lý danh mục sản phẩm và ảnh nhãn để chọn nhanh khi tạo đơn hoặc chia sẻ qua Zalo."
        actionHref="/products/new"
        actionLabel="Thêm sản phẩm"
      />

      <form className="grid gap-3 md:max-w-md md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={result.q}
            placeholder="Tìm theo tên hoặc mã số"
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm"
          description="Thêm sản phẩm và tải ảnh nhãn để dùng khi tạo đơn và chia sẻ thông tin."
        />
      ) : (
        <DataTable headers={["Nhãn", "Tên", "Mã", "ĐVT", "Giá mặc định", "Ngày tạo", ""]}>
          {result.items.map((product) => {
            const labelUrl = getProductLabelUrl(product.label_image_path);

            return (
              <DataRow key={product.id}>
                <DataCell>
                  {labelUrl ? (
                    <Image
                      src={labelUrl}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-xl object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DataCell>
                <DataCell>{product.name}</DataCell>
                <DataCell>{product.sku_code || "—"}</DataCell>
                <DataCell>{product.unit || "—"}</DataCell>
                <DataCell>{formatCurrency(product.default_unit_price)}</DataCell>
                <DataCell>{formatDate(product.created_at)}</DataCell>
                <DataCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/products/${product.id}`}>Sửa</Link>
                  </Button>
                </DataCell>
              </DataRow>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
