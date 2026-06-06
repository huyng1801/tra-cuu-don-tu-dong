import Image from "next/image";

import { formatCurrency } from "@/lib/utils";

export interface OrderSharePreviewProps {
  orderCode: string;
  productName: string;
  totalPrice: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  labelUrl?: string | null;
}

export function OrderSharePreview({
  orderCode,
  productName,
  totalPrice,
  customerName,
  customerPhone,
  customerAddress,
  labelUrl,
}: OrderSharePreviewProps) {
  const rows = [
    { label: "Mã đơn", value: orderCode },
    { label: "Khách", value: customerName?.trim() || "—" },
    { label: "SĐT", value: customerPhone?.trim() || "—" },
    { label: "Địa chỉ", value: customerAddress?.trim() || "—" },
    { label: "Sản phẩm", value: productName },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border-2 border-border/80 bg-card shadow-sm">
      <div className="border-b border-border/70 bg-accent/50 px-5 py-4 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Thông tin đơn hàng
        </p>
        <p className="mt-1 font-mono text-base font-semibold text-foreground">{orderCode}</p>
      </div>

      <div className="space-y-3 px-5 py-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 text-sm">
            <span className="font-medium text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground break-words">{value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3">
          <span className="text-sm font-semibold text-primary">COD</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      {labelUrl ? (
        <div className="border-t border-border/70 bg-accent/30 px-5 py-4">
          <p className="mb-3 text-center text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Nhãn sản phẩm
          </p>
          <div className="flex justify-center rounded-2xl border border-border/70 bg-white p-3">
            <Image
              src={labelUrl}
              alt={`Nhãn ${productName}`}
              width={560}
              height={560}
              className="max-h-72 w-full object-contain"
              unoptimized
            />
          </div>
        </div>
      ) : (
        <div className="border-t border-dashed border-border/70 px-5 py-4 text-center text-sm text-muted-foreground">
          Chưa có ảnh nhãn. Thêm tại mục Sản phẩm & nhãn.
        </div>
      )}
    </div>
  );
}
