import { formatCurrency } from "@/lib/utils";

export interface OrderShareInput {
  order_code: string;
  product_name: string;
  total_price: number;
  customer?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export function formatOrderShareText(order: OrderShareInput) {
  const lines = [
    `Mã đơn: ${order.order_code}`,
    `Khách: ${order.customer?.name ?? "—"}`,
    `SĐT: ${order.customer?.phone ?? "—"}`,
    `Địa chỉ: ${order.customer?.address?.trim() || "—"}`,
    `Sản phẩm: ${order.product_name}`,
    `COD: ${formatCurrency(order.total_price).replace(/\s/g, "")}`,
  ];

  return lines.join("\n");
}
