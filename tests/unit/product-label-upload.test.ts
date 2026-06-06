import { describe, expect, it } from "vitest";

import {
  PRODUCT_LABEL_MAX_BYTES,
  resolveLabelContentType,
  validateProductLabelFile,
} from "@/lib/product-label-upload";

describe("product label upload validation", () => {
  it("accepts png files", () => {
    expect(
      validateProductLabelFile({
        name: "label.png",
        type: "image/png",
        size: 120_000,
      }),
    ).toBeNull();
  });

  it("rejects unsupported file types", () => {
    expect(
      validateProductLabelFile({
        name: "label.pdf",
        type: "application/pdf",
        size: 120_000,
      }),
    ).toMatch(/JPG, PNG/);
  });

  it("rejects oversized files", () => {
    expect(
      validateProductLabelFile({
        name: "label.jpg",
        type: "image/jpeg",
        size: PRODUCT_LABEL_MAX_BYTES + 1,
      }),
    ).toMatch(/5MB/);
  });

  it("resolves content type from extension when browser omits mime", () => {
    expect(resolveLabelContentType({ name: "label.jpeg", type: "" })).toBe("image/jpeg");
  });
});
