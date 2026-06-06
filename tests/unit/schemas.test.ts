import { describe, expect, it } from "vitest";

import { customerFormSchema } from "@/features/customers/schema";
import { orderFormSchema } from "@/features/orders/schema";

describe("form schemas", () => {
  it("normalizes optional customer fields", () => {
    const result = customerFormSchema.parse({
      name: "Nguyen Van A",
      phone: "0901234567",
      facebook_url: "",
      facebook_uid: "",
      address: "",
      note: "",
    });

    expect(result.facebook_url).toBeNull();
    expect(result.note).toBeNull();
  });

  it("requires existing customer id or new customer info in order form", () => {
    expect(() =>
      orderFormSchema.parse({
        customer_mode: "existing",
        customer_id: "",
        product_name: "San pham",
        quantity: 1,
        unit_price: 1000,
        status: "new",
      }),
    ).toThrow();

    const result = orderFormSchema.parse({
      customer_mode: "new",
      customer_name: "Le Thi B",
      customer_phone: "0911111111",
      customer_address: "",
      product_name: "San pham",
      quantity: 1,
      unit_price: 1000,
      status: "new",
      note: "",
    });

    expect(result.customer_name).toBe("Le Thi B");
    expect(result.note).toBeNull();
  });
});

