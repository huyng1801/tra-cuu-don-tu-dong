"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrderSharePreview } from "@/features/orders/order-share-preview";
import { formatOrderShareText } from "@/features/orders/format-order-share";
import { getProductLabelUrl } from "@/lib/product-labels";

interface ShareOrderCardProps {
  order: {
    id: string;
    order_code: string;
    product_name: string;
    total_price: number;
    customer?: {
      name?: string | null;
      phone?: string | null;
      address?: string | null;
    } | null;
    product?: {
      label_image_path?: string | null;
    } | null;
  };
}

export function ShareOrderCard({ order }: ShareOrderCardProps) {
  const shareText = formatOrderShareText(order);
  const labelUrl = getProductLabelUrl(order.product?.label_image_path);

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Đã sao chép nội dung đơn.");
    } catch {
      toast.error("Không thể sao chép. Vui lòng chọn và copy thủ công.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Share2 className="size-4 shrink-0" />
            Chia sẻ đơn
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto p-0 sm:max-w-lg">
          <div className="space-y-4 p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle>Chia sẻ đơn qua Zalo</DialogTitle>
              <DialogDescription>
                Chụp khung bên dưới hoặc sao chép nội dung text để gửi kế toán / xưởng.
              </DialogDescription>
            </DialogHeader>

            <OrderSharePreview
              orderCode={order.order_code}
              productName={order.product_name}
              totalPrice={order.total_price}
              customerName={order.customer?.name}
              customerPhone={order.customer?.phone}
              customerAddress={order.customer?.address}
              labelUrl={labelUrl}
            />

            <details className="rounded-2xl border border-border/70 bg-accent/30 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-medium text-foreground">
                Xem nội dung text để copy
              </summary>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">
                {shareText}
              </pre>
            </details>

            <Button type="button" className="w-full gap-2" onClick={copyShareText}>
              <Copy className="size-4" />
              Sao chép nội dung
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button asChild variant="outline" className="w-full justify-start gap-2">
        <a href={`/api/orders/${order.id}/export-warehouse-slip`}>
          <Download className="size-4 shrink-0" />
          Xuất phiếu xuất kho
        </a>
      </Button>
    </div>
  );
}
