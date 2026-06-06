import { describe, expect, it } from "vitest";

import { formatVietnameseCurrencyWords } from "@/lib/vietnamese-currency-words";

describe("formatVietnameseCurrencyWords", () => {
  it("formats zero", () => {
    expect(formatVietnameseCurrencyWords(0)).toBe("Không đồng");
  });

  it("formats sample warehouse slip amount", () => {
    expect(formatVietnameseCurrencyWords(390_000)).toBe("Ba trăm chín mươi nghìn đồng");
  });

  it("formats round hundred thousand", () => {
    expect(formatVietnameseCurrencyWords(300_000)).toBe("Ba trăm nghìn đồng");
  });
});
