import { z } from "zod";

import { paginationQuerySchema } from "@/lib/validation";
import { optionalText, optionalUrl } from "@/lib/validation";

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên.").max(120),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ.").max(20),
  facebook_url: optionalUrl(),
  facebook_uid: optionalText(120),
  address: optionalText(255),
  note: optionalText(1000),
});

export const customersQuerySchema = paginationQuerySchema.extend({});

export type CustomerFormValues = z.input<typeof customerFormSchema>;
export type CustomerFormInput = z.output<typeof customerFormSchema>;
export type CustomersQueryInput = z.infer<typeof customersQuerySchema>;
