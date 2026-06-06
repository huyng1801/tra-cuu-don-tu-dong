import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email khong hop le."),
  password: z.string().min(6, "Mat khau toi thieu 6 ky tu."),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Vui long nhap ten hien thi."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

