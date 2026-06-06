import { z } from "zod";

import { paginationQuerySchema } from "@/lib/validation";

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên sản phẩm.").max(160),
  sku_code: z.string().trim().max(40).optional().default(""),
  unit: z.string().trim().max(60).optional().default(""),
  default_unit_price: z.coerce.number().min(0, "Giá mặc định không được âm."),
});

export const productsQuerySchema = paginationQuerySchema.extend({});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormInput = z.output<typeof productFormSchema>;
export type ProductsQueryInput = z.infer<typeof productsQuerySchema>;
