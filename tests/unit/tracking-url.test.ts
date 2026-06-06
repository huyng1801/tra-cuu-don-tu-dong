import { describe, expect, it } from "vitest";

import { buildTrackingUrl } from "@/lib/tracking-url";

describe("buildTrackingUrl", () => {
  it("builds GHN tracking URLs", () => {
    expect(buildTrackingUrl("ghn", "ABC123")).toContain("order_code=ABC123");
  });

  it("returns empty string for carrier without template", () => {
    expect(buildTrackingUrl("other", "ABC123")).toBe("");
  });
});

