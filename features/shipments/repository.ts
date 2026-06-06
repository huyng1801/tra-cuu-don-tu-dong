import type { SupabaseClient } from "@supabase/supabase-js";

import { buildTrackingUrl } from "@/lib/tracking-url";
import type { Database } from "@/lib/supabase/types";
import { getRange } from "@/lib/utils";
import {
  shipmentFormSchema,
  shipmentsQuerySchema,
  type ShipmentFormInput,
} from "@/features/shipments/schema";

export interface ShipmentListItem {
  id: string;
  order_id: string;
  carrier: string;
  tracking_code: string;
  tracking_url: string | null;
  shipping_status: string;
  last_sync_at: string | null;
  created_at: string;
  order: {
    id: string;
    order_code: string;
    product_name: string;
    customer_name: string | null;
  } | null;
}

async function mapShipments(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  rows: Database["public"]["Tables"]["shipments"]["Row"][],
) {
  const orderIds = rows.map((shipment) => shipment.order_id);
  const { data: orders, error: ordersError } = orderIds.length
    ? await supabase
        .from("orders")
        .select("id,order_code,product_name,customer_id")
        .eq("owner_user_id", ownerUserId)
        .in("id", orderIds)
    : { data: [], error: null };

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const customerIds = [...new Set((orders ?? []).map((order) => order.customer_id))];
  const { data: customers, error: customersError } = customerIds.length
    ? await supabase
        .from("customers")
        .select("id,name")
        .eq("owner_user_id", ownerUserId)
        .in("id", customerIds)
    : { data: [], error: null };

  if (customersError) {
    throw new Error(customersError.message);
  }

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const orderMap = new Map(
    (orders ?? []).map((order) => [
      order.id,
      {
        id: order.id,
        order_code: order.order_code,
        product_name: order.product_name,
        customer_name: customerMap.get(order.customer_id)?.name ?? null,
      },
    ]),
  );

  return rows.map((shipment) => ({
    ...shipment,
    order: orderMap.get(shipment.order_id) ?? null,
  }));
}

export async function listShipments(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  query: Partial<Record<string, string | string[] | undefined>>,
) {
  const parsed = shipmentsQuerySchema.parse(query);
  const { from, to } = getRange(parsed.page, parsed.pageSize);

  let request = supabase
    .from("shipments")
    .select("*", {
      count: "exact",
    })
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (parsed.q) {
    request = request.or(`tracking_code.ilike.%${parsed.q}%`);
  }

  if (parsed.carrier) {
    request = request.eq("carrier", parsed.carrier);
  }

  if (parsed.shippingStatus) {
    request = request.eq("shipping_status", parsed.shippingStatus);
  }

  const { data, count, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  const items = await mapShipments(supabase, ownerUserId, data ?? []);

  return {
    items,
    q: parsed.q,
    carrier: parsed.carrier,
    shippingStatus: parsed.shippingStatus,
    pagination: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / parsed.pageSize)),
    },
  };
}

export async function getShipmentById(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [orderResult] = await Promise.all([
    mapShipments(supabase, ownerUserId, [data]),
  ]);

  return orderResult[0];
}

export async function createShipment(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: ShipmentFormInput,
) {
  const values = shipmentFormSchema.parse(input);
  const trackingUrl = buildTrackingUrl(values.carrier, values.tracking_code);

  const { count, error: duplicateError } = await supabase
    .from("shipments")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("owner_user_id", ownerUserId)
    .eq("order_id", values.order_id);

  if (duplicateError) {
    throw new Error(duplicateError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Mỗi đơn chỉ được gắn một vận đơn.");
  }

  const { data, error } = await supabase
    .from("shipments")
    .insert({
      owner_user_id: ownerUserId,
      order_id: values.order_id,
      carrier: values.carrier,
      tracking_code: values.tracking_code,
      tracking_url: trackingUrl || null,
      shipping_status: values.shipping_status,
      last_sync_at: null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateShipment(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
  input: ShipmentFormInput,
) {
  const values = shipmentFormSchema.parse(input);
  const trackingUrl = buildTrackingUrl(values.carrier, values.tracking_code);

  const { data, error } = await supabase
    .from("shipments")
    .update({
      order_id: values.order_id,
      carrier: values.carrier,
      tracking_code: values.tracking_code,
      tracking_url: trackingUrl || null,
      shipping_status: values.shipping_status,
      last_sync_at: null,
    })
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
