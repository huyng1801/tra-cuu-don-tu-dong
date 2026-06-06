import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { DeleteProductButton } from "@/features/products/delete-product-button";
import { ProductForm } from "@/features/products/product-form";
import { getProductById } from "@/features/products/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const product = await getProductById(supabase, user.id, productId);

  return (
    <div className="space-y-6">
      <PageHeader title={product.name} description="Cập nhật thông tin sản phẩm và ảnh nhãn." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
            <CardDescription>
              Thay đổi tên, mã, đơn vị, giá mặc định hoặc tải lại ảnh nhãn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              mode="edit"
              productId={product.id}
              currentLabelPath={product.label_image_path}
              defaultValues={{
                name: product.name,
                sku_code: product.sku_code,
                unit: product.unit,
                default_unit_price: product.default_unit_price,
              }}
            />
          </CardContent>
        </Card>

        <DeleteProductButton productId={product.id} />
      </div>
    </div>
  );
}
