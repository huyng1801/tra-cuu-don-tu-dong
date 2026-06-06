import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/shipments/route";

const mocks = vi.hoisted(() => ({
  getApiAuthContext: vi.fn(),
  listShipments: vi.fn(),
  createShipment: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  getApiAuthContext: mocks.getApiAuthContext,
}));

vi.mock("@/features/shipments/repository", () => ({
  listShipments: mocks.listShipments,
  createShipment: mocks.createShipment,
}));

describe("shipments route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns shipments list for authenticated owner", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });
    mocks.listShipments.mockResolvedValue({
      items: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
    });

    const response = await GET(new Request("http://localhost/api/shipments"));
    expect(response.status).toBe(200);
  });

  it("rejects invalid shipment body", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });

    const response = await POST(
      new Request("http://localhost/api/shipments", {
        method: "POST",
        body: JSON.stringify({
          order_id: "",
          carrier: "ghn",
          tracking_code: "",
          shipping_status: "pending_pickup",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createShipment).not.toHaveBeenCalled();
  });
});
