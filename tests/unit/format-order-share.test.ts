import { describe, expect, it } from "vitest";

import { formatOrderShareText } from "@/features/orders/format-order-share";

describe("formatOrderShareText", () => {
  it("formats order info for Zalo sharing", () => {
    const text = formatOrderShareText({
      order_code: "CRM-260606-154940-782",
      product_name: "Combo test UX",
      total_price: 300_000,
      customer: {
        name: "Nguyễn Văn A",
        phone: "0912345678",
        address: "12 Nguyễn Huệ, Q1",
      },
    });

    expect(text).toContain("Mã đơn: CRM-260606-154940-782");
    expect(text).toContain("Khách: Nguyễn Văn A");
    expect(text).toContain("SĐT: 0912345678");
    expect(text).toContain("Địa chỉ: 12 Nguyễn Huệ, Q1");
    expect(text).toContain("Sản phẩm: Combo test UX");
    expect(text).toContain("COD: 300.000₫");
  });
});
