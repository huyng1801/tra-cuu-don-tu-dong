import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/orders/route";

const mocks = vi.hoisted(() => ({
  getApiAuthContext: vi.fn(),
  listOrders: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  getApiAuthContext: mocks.getApiAuthContext,
}));

vi.mock("@/features/orders/repository", () => ({
  listOrders: mocks.listOrders,
  createOrder: mocks.createOrder,
}));

describe("orders route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is unauthenticated", async () => {
    mocks.getApiAuthContext.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/orders"));
    expect(response.status).toBe(401);
  });

  it("returns orders list when authenticated", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });
    mocks.listOrders.mockResolvedValue({
      items: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
    });

    const response = await GET(new Request("http://localhost/api/orders"));
    expect(response.status).toBe(200);
  });

  it("rejects invalid order payload", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });

    const response = await POST(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_mode: "existing",
          customer_id: "",
          product_name: "",
          quantity: 0,
          unit_price: -1,
          status: "new",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });
});
