import { describe, expect, it, vi } from "vitest";

import { generateOrderCode } from "@/lib/order-code";

describe("generateOrderCode", () => {
  it("generates readable codes with CRM prefix", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1234);
    const code = generateOrderCode(new Date("2026-06-06T08:09:10.000Z"));

    expect(code).toMatch(/^CRM-260606-\d{6}-\d{3}$/);
  });
});
