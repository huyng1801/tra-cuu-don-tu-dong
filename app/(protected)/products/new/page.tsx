import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/features/products/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm sản phẩm"
        description="Lưu thông tin sản phẩm và ảnh nhãn để chọn nhanh khi tạo đơn hàng."
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
          <CardDescription>
            Mã số và đơn vị tính sẽ được dùng khi xuất phiếu xuất kho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
