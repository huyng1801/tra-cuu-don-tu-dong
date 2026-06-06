export const ORDER_STATUS_VALUES = [
  "new",
  "confirmed",
  "preparing",
  "shipping",
  "completed",
  "cancelled",
] as const;

export const SHIPPING_STATUS_VALUES = [
  "pending_pickup",
  "picking_up",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
] as const;

export const CARRIER_VALUES = [
  "ghn",
  "ghtk",
  "viettel_post",
  "jt_express",
  "shopee_express",
  "other",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export type ShippingStatus = (typeof SHIPPING_STATUS_VALUES)[number];
export type CarrierCode = (typeof CARRIER_VALUES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Moi",
  confirmed: "Da xac nhan",
  preparing: "Dang chuan bi",
  shipping: "Dang giao",
  completed: "Hoan thanh",
  cancelled: "Huy",
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  pending_pickup: "Cho lay hang",
  picking_up: "Dang lay hang",
  in_transit: "Dang van chuyen",
  delivered: "Giao thanh cong",
  returned: "Hoan hang",
  cancelled: "Huy van chuyen",
};

export const CARRIER_LABELS: Record<CarrierCode, string> = {
  ghn: "GHN",
  ghtk: "GHTK",
  viettel_post: "Viettel Post",
  jt_express: "J&T Express",
  shopee_express: "Shopee Express",
  other: "Khac",
};

export const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Khach hang" },
  { href: "/orders", label: "Don hang" },
  { href: "/shipments", label: "Van don" },
  { href: "/facebook-events", label: "Facebook Events" },
  { href: "/settings", label: "Cai dat" },
] as const;

export const PAGE_SIZE = 10;
