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
  new: "Mới",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  pending_pickup: "Chờ lấy hàng",
  picking_up: "Đang lấy hàng",
  in_transit: "Đang vận chuyển",
  delivered: "Giao thành công",
  returned: "Hoàn hàng",
  cancelled: "Hủy vận chuyển",
};

export const CARRIER_LABELS: Record<CarrierCode, string> = {
  ghn: "GHN",
  ghtk: "GHTK",
  viettel_post: "Viettel Post",
  jt_express: "J&T Express",
  shopee_express: "Shopee Express",
  other: "Khác",
};

export const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/customers", label: "Khách hàng" },
  { href: "/products", label: "Sản phẩm & nhãn" },
  { href: "/orders", label: "Đơn hàng & vận đơn" },
  { href: "/facebook-events", label: "Sự kiện Facebook" },
  { href: "/settings", label: "Cài đặt" },
] as const;

export const PAGE_SIZE = 10;
