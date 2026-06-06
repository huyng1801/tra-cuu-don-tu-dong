"use client";

import Image from "next/image";
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
import { formatOrderShareText } from "@/features/orders/format-order-share";
import { getProductLabelUrl } from "@/lib/product-labels";
import { formatCurrency } from "@/lib/utils";

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
          <Button variant="outline" className="w-full justify-start">
            <Share2 className="size-4" />
            Chia sẻ đơn
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chia sẻ đơn qua Zalo</DialogTitle>
            <DialogDescription>
              Chụp màn hình hoặc sao chép nội dung bên dưới để gửi cho kế toán / xưởng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
              {shareText}
            </pre>

            {labelUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-accent/40 p-3">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Nhãn sản phẩm</p>
                <Image
                  src={labelUrl}
                  alt={order.product_name}
                  width={480}
                  height={480}
                  className="mx-auto max-h-64 w-auto object-contain"
                  unoptimized
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">COD</span>
              <span className="font-semibold">{formatCurrency(order.total_price)}</span>
            </div>
          </div>

          <Button type="button" onClick={copyShareText}>
            <Copy className="size-4" />
            Sao chép nội dung
          </Button>
        </DialogContent>
      </Dialog>

      <Button asChild variant="outline" className="w-full justify-start">
        <a href={`/api/orders/${order.id}/export-warehouse-slip`}>
          <Download className="size-4" />
          Xuất phiếu xuất kho
        </a>
      </Button>
    </div>
  );
}
