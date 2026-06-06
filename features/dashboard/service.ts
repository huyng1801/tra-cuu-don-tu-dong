import type { SupabaseClient } from "@supabase/supabase-js";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";

import type { Database } from "@/lib/supabase/types";

export interface DashboardMetrics {
  totalCustomers: number;
  totalOrders: number;
  newOrders: number;
  shippingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  estimatedRevenue: number;
  dailySeries: Array<{
    day: string;
    orders: number;
  }>;
}

export function computeDashboardMetrics(
  orders: Array<{ status: string; total_price: number; created_at: string }>,
  customersCount: number,
): DashboardMetrics {
  const totalOrders = orders.length;
  const newOrders = orders.filter((order) => order.status === "new").length;
  const shippingOrders = orders.filter((order) => order.status === "shipping").length;
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const estimatedRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_price ?? 0), 0);

  const start = startOfDay(subDays(new Date(), 6));
  const end = endOfDay(new Date());

  const dailySeries = eachDayOfInterval({ start, end }).map((date) => {
    const day = format(date, "dd/MM");
    const ordersCount = orders.filter(
      (order) => format(new Date(order.created_at), "dd/MM") === day,
    ).length;

    return {
      day,
      orders: ordersCount,
    };
  });

  return {
    totalCustomers: customersCount,
    totalOrders,
    newOrders,
    shippingOrders,
    completedOrders,
    cancelledOrders,
    estimatedRevenue,
    dailySeries,
  };
}

export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
) {
  const [{ count: totalCustomers, error: customerError }, { data: orders, error: orderError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("owner_user_id", ownerUserId),
      supabase
        .from("orders")
        .select("status,total_price,created_at")
        .eq("owner_user_id", ownerUserId),
    ]);

  if (customerError) {
    throw new Error(customerError.message);
  }

  if (orderError) {
    throw new Error(orderError.message);
  }

  return computeDashboardMetrics(orders ?? [], totalCustomers ?? 0);
}
