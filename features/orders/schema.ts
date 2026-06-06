import { z } from "zod";

import { ORDER_STATUS_VALUES } from "@/lib/constants";
import { optionalText, paginationQuerySchema, optionalEnum } from "@/lib/validation";

export const orderFormSchema = z
  .object({
    customer_mode: z.enum(["existing", "new"]),
    customer_id: z.string().trim().optional().default(""),
    customer_name: z.string().trim().optional().default(""),
    customer_phone: z.string().trim().optional().default(""),
    customer_address: optionalText(255),
    product_name: z.string().trim().min(2, "Vui long nhap ten san pham.").max(160),
    quantity: z.coerce.number().int().min(1, "So luong toi thieu la 1."),
    unit_price: z.coerce.number().min(0, "Gia ban khong duoc am."),
    status: z.enum(ORDER_STATUS_VALUES),
    note: optionalText(1000),
  })
  .superRefine((value, ctx) => {
    if (value.customer_mode === "existing" && !value.customer_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_id"],
        message: "Vui long chon khach hang.",
      });
    }

    if (value.customer_mode === "new") {
      if (value.customer_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customer_name"],
          message: "Nhap ten khach hang moi.",
        });
      }

      if (value.customer_phone.trim().length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customer_phone"],
          message: "Nhap so dien thoai hop le.",
        });
      }
    }
  });

export const ordersQuerySchema = paginationQuerySchema.extend({
  status: optionalEnum(ORDER_STATUS_VALUES),
  customerId: z.string().trim().optional(),
});

export type OrderFormValues = z.input<typeof orderFormSchema>;
export type OrderFormInput = z.output<typeof orderFormSchema>;
export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;
