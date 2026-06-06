import type { CarrierCode } from "@/lib/constants";

export function buildTrackingUrl(carrier: CarrierCode, trackingCode: string) {
  const code = encodeURIComponent(trackingCode.trim());

  switch (carrier) {
    case "ghn":
      return `https://donhang.ghn.vn/?order_code=${code}`;
    case "ghtk":
      return `https://i.ghtk.vn/${code}`;
    case "viettel_post":
      return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?b=${code}`;
    case "jt_express":
      return `https://jtexpress.vn/vi/tracking?billcode=${code}`;
    case "shopee_express":
      return `https://spx.vn/#/track?trackingNumber=${code}`;
    case "other":
    default:
      return "";
  }
}

