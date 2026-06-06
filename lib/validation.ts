import { z } from "zod";

export function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null)
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

export function optionalUrl() {
  return z
    .string()
    .trim()
    .url("URL khong hop le.")
    .or(z.literal(""))
    .transform((value) => value || null)
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

export const paginationQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z
    .enum(values)
    .or(z.literal(""))
    .optional()
    .transform((value) => (value ? value : undefined));
}

