import { z } from "zod";

import { CARRIER_VALUES, ORDER_STATUS_VALUES, SHIPPING_STATUS_VALUES } from "@/lib/constants";
import { optionalText, paginationQuerySchema, optionalEnum } from "@/lib/validation";

export const orderFormSchema = z
  .object({
    customer_mode: z.enum(["existing", "new"]),
    customer_id: z.string().trim().optional().default(""),
    customer_name: z.string().trim().optional().default(""),
    customer_phone: z.string().trim().optional().default(""),
    customer_address: optionalText(255),
    product_id: z.string().trim().optional().default(""),
    product_name: z.string().trim().min(2, "Vui lòng nhập tên sản phẩm.").max(160),
    quantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1."),
    unit_price: z.coerce.number().min(0, "Giá bán không được âm."),
    status: z.enum(ORDER_STATUS_VALUES),
    note: optionalText(1000),
  })
  .superRefine((value, ctx) => {
    if (value.customer_mode === "existing" && !value.customer_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_id"],
        message: "Vui lòng chọn khách hàng.",
      });
    }

    if (value.customer_mode === "new") {
      if (value.customer_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customer_name"],
          message: "Nhập tên khách hàng mới.",
        });
      }

      if (value.customer_phone.trim().length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customer_phone"],
          message: "Nhập số điện thoại hợp lệ.",
        });
      }
    }
  });

export const ordersQuerySchema = paginationQuerySchema.extend({
  status: optionalEnum(ORDER_STATUS_VALUES),
  carrier: optionalEnum(CARRIER_VALUES),
  shippingStatus: optionalEnum(SHIPPING_STATUS_VALUES),
  customerId: z.string().trim().optional(),
});

export type OrderFormValues = z.input<typeof orderFormSchema>;
export type OrderFormInput = z.output<typeof orderFormSchema>;
export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;
