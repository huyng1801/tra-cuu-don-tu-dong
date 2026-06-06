import { z } from "zod";

import { CARRIER_VALUES, SHIPPING_STATUS_VALUES } from "@/lib/constants";
import { optionalEnum, paginationQuerySchema } from "@/lib/validation";

export const shipmentFormSchema = z.object({
  order_id: z.string().trim().min(1, "Vui lòng chọn đơn hàng."),
  carrier: z.enum(CARRIER_VALUES),
  tracking_code: z
    .string()
    .trim()
    .min(4, "Nhập mã vận đơn hợp lệ.")
    .max(64, "Mã vận đơn quá dài."),
  shipping_status: z.enum(SHIPPING_STATUS_VALUES),
});

export const shipmentsQuerySchema = paginationQuerySchema.extend({
  carrier: optionalEnum(CARRIER_VALUES),
  shippingStatus: optionalEnum(SHIPPING_STATUS_VALUES),
});

export type ShipmentFormValues = z.input<typeof shipmentFormSchema>;
export type ShipmentFormInput = z.output<typeof shipmentFormSchema>;
export type ShipmentsQueryInput = z.infer<typeof shipmentsQuerySchema>;
