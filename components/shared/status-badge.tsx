import { Badge } from "@/components/ui/badge";
import {
  CARRIER_LABELS,
  ORDER_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  type CarrierCode,
  type OrderStatus,
  type ShippingStatus,
} from "@/lib/constants";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === "completed"
      ? "success"
      : status === "cancelled"
        ? "destructive"
        : status === "shipping"
          ? "warning"
          : "neutral";

  return <Badge variant={variant}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function ShippingStatusBadge({ status }: { status: ShippingStatus }) {
  const variant =
    status === "delivered"
      ? "success"
      : status === "cancelled" || status === "returned"
        ? "destructive"
        : status === "in_transit"
          ? "warning"
          : "neutral";

  return <Badge variant={variant}>{SHIPPING_STATUS_LABELS[status]}</Badge>;
}

export function CarrierBadge({ carrier }: { carrier: CarrierCode }) {
  return <Badge variant="muted">{CARRIER_LABELS[carrier]}</Badge>;
}

