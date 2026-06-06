import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/customers/route";

const mocks = vi.hoisted(() => ({
  getApiAuthContext: vi.fn(),
  listCustomers: vi.fn(),
  createCustomer: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  getApiAuthContext: mocks.getApiAuthContext,
}));

vi.mock("@/features/customers/repository", () => ({
  listCustomers: mocks.listCustomers,
  createCustomer: mocks.createCustomer,
}));

describe("customers route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when auth is missing", async () => {
    mocks.getApiAuthContext.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/customers"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns customer list when authenticated", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });
    mocks.listCustomers.mockResolvedValue({
      items: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
    });

    const response = await GET(new Request("http://localhost/api/customers?q=abc"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.listCustomers).toHaveBeenCalled();
    expect(body.success).toBe(true);
  });

  it("validates payload before creating customer", async () => {
    mocks.getApiAuthContext.mockResolvedValue({
      ownerUserId: "user-1",
      supabase: {},
    });

    const response = await POST(
      new Request("http://localhost/api/customers", {
        method: "POST",
        body: JSON.stringify({ name: "", phone: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createCustomer).not.toHaveBeenCalled();
  });
});
