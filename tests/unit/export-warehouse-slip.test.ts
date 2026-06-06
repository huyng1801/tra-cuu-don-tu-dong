import { describe, expect, it } from "vitest";

import {
  buildWarehouseSlipWorkbook,
  buildWarehouseSlipFilename,
} from "@/features/orders/export-warehouse-slip";
import { DEFAULT_SHOP_SETTINGS } from "@/features/settings/schema";

describe("export warehouse slip", () => {
  const order = {
    order_code: "CRM-260520-120000-782",
    product_name: "CAXI B3",
    quantity: 2,
    unit_price: 195_000,
    total_price: 390_000,
    created_at: "2025-05-20T08:00:00.000Z",
    customer: {
      name: "Nguyễn Hồng",
      phone: "0344873946",
      address: "Phố quang minh, phường tỉnh gia, thanh hoá",
    },
    product: {
      sku_code: "CB",
      unit: "1 lít/chai",
    },
  };

  it("builds filename from customer and date", () => {
    expect(buildWarehouseSlipFilename(order)).toBe("PHIẾU XUẤT KHO Nguyễn Hồng 20.05.2025.xlsx");
  });

  it("fills key cells from template", async () => {
    const workbook = await buildWarehouseSlipWorkbook(order, {
      owner_user_id: "owner",
      ...DEFAULT_SHOP_SETTINGS,
      updated_at: "2025-05-20T08:00:00.000Z",
    });
    const sheet = workbook.worksheets[0];

    expect(sheet?.getCell("A1").value).toBe(DEFAULT_SHOP_SETTINGS.company_name);
    expect(sheet?.getCell("B14").value).toBe("CAXI B3");
    expect(sheet?.getCell("C14").value).toBe("CB");
    expect(sheet?.getCell("D14").value).toBe("1 lít/chai");
    expect(sheet?.getCell("E14").value).toBe(2);
    expect(sheet?.getCell("F14").value).toBe(195);
    expect(String(sheet?.getCell("A16").value)).toContain("Ba trăm chín mươi nghìn đồng");
  });
});
