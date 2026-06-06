import { describe, expect, it } from "vitest";

import { computeDashboardMetrics } from "@/features/dashboard/service";

describe("computeDashboardMetrics", () => {
  it("aggregates counts and revenue", () => {
    const metrics = computeDashboardMetrics(
      [
        { status: "new", total_price: 100000, created_at: "2026-06-06T10:00:00.000Z" },
        { status: "shipping", total_price: 250000, created_at: "2026-06-05T10:00:00.000Z" },
        { status: "completed", total_price: 300000, created_at: "2026-06-04T10:00:00.000Z" },
        { status: "cancelled", total_price: 999999, created_at: "2026-06-03T10:00:00.000Z" },
      ],
      12,
    );

    expect(metrics.totalCustomers).toBe(12);
    expect(metrics.totalOrders).toBe(4);
    expect(metrics.newOrders).toBe(1);
    expect(metrics.shippingOrders).toBe(1);
    expect(metrics.completedOrders).toBe(1);
    expect(metrics.cancelledOrders).toBe(1);
    expect(metrics.estimatedRevenue).toBe(650000);
    expect(metrics.dailySeries).toHaveLength(7);
  });
});

