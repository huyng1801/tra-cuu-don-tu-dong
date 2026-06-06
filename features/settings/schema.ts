import { z } from "zod";

export const DEFAULT_SHOP_SETTINGS = {
  company_name: "CÔNG TY TNHH XUẤT NHẬP KHẨU ASA VIỆT NAM",
  company_address:
    "ĐC: 37K/7, Khu vực 6, Phường Hưng Thạnh, Quận Cái Răng, Thành Phố Cần Thơ",
  tax_code: "1801716083",
  document_code: "TT01-NXG-BM001",
  slip_number_prefix: "ASA",
  warehouse_name: "CÔNG TY TNHH XUẤT NHẬP KHẨU ASA VIỆT NAM",
} as const;

export const shopSettingsFormSchema = z.object({
  company_name: z.string().trim().min(2, "Vui lòng nhập tên công ty.").max(200),
  company_address: z.string().trim().min(2, "Vui lòng nhập địa chỉ công ty.").max(500),
  tax_code: z.string().trim().min(1, "Vui lòng nhập MST.").max(40),
  document_code: z.string().trim().min(1, "Vui lòng nhập số hiệu chứng từ.").max(80),
  slip_number_prefix: z.string().trim().min(1, "Vui lòng nhập tiền tố số phiếu.").max(20),
  warehouse_name: z.string().trim().min(2, "Vui lòng nhập tên kho xuất.").max(200),
});

export type ShopSettingsFormValues = z.input<typeof shopSettingsFormSchema>;
export type ShopSettingsFormInput = z.output<typeof shopSettingsFormSchema>;

export interface ShopSettings {
  owner_user_id: string;
  company_name: string;
  company_address: string;
  tax_code: string;
  document_code: string;
  slip_number_prefix: string;
  warehouse_name: string;
  updated_at: string;
}
