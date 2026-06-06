import type { SupabaseClient } from "@supabase/supabase-js";

import { generateOrderCode } from "@/lib/order-code";
import type { Database } from "@/lib/supabase/types";
import { getRange } from "@/lib/utils";
import {
  orderFormSchema,
  ordersQuerySchema,
  type OrderFormInput,
} from "@/features/orders/schema";

export interface OrderListItem {
  id: string;
  order_code: string;
  customer_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: "new" | "confirmed" | "preparing" | "shipping" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  } | null;
  shipment: {
    id: string;
    carrier: string;
    tracking_code: string;
    shipping_status: string;
  } | null;
}

async function resolveCustomerId(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: OrderFormInput,
) {
  if (input.customer_mode === "existing") {
    return input.customer_id;
  }

  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("customers")
    .select("id")
    .eq("owner_user_id", ownerUserId)
    .eq("phone", input.customer_phone)
    .maybeSingle();

  if (existingCustomerError) {
    throw new Error(existingCustomerError.message);
  }

  if (existingCustomer) {
    return existingCustomer.id;
  }

  const { data: newCustomer, error: createCustomerError } = await supabase
    .from("customers")
    .insert({
      owner_user_id: ownerUserId,
      name: input.customer_name.trim(),
      phone: input.customer_phone.trim(),
      address: input.customer_address,
    })
    .select("id")
    .single();

  if (createCustomerError) {
    throw new Error(createCustomerError.message);
  }

  return newCustomer.id;
}

async function mapOrders(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  rows: Database["public"]["Tables"]["orders"]["Row"][],
) {
  const customerIds = [...new Set(rows.map((order) => order.customer_id))];
  const orderIds = rows.map((order) => order.id);

  const [{ data: customers, error: customerError }, { data: shipments, error: shipmentError }] =
    await Promise.all([
      customerIds.length
        ? supabase
            .from("customers")
            .select("id,name,phone")
            .eq("owner_user_id", ownerUserId)
            .in("id", customerIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase
            .from("shipments")
            .select("id,order_id,carrier,tracking_code,shipping_status")
            .eq("owner_user_id", ownerUserId)
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (customerError) {
    throw new Error(customerError.message);
  }

  if (shipmentError) {
    throw new Error(shipmentError.message);
  }

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const shipmentMap = new Map((shipments ?? []).map((shipment) => [shipment.order_id, shipment]));

  return rows.map((row) => ({
    ...row,
    status: row.status as OrderListItem["status"],
    customer: customerMap.get(row.customer_id) ?? null,
    shipment: shipmentMap.get(row.id) ?? null,
  }));
}

export async function listOrders(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  query: Partial<Record<string, string | string[] | undefined>>,
) {
  const parsed = ordersQuerySchema.parse(query);
  const { from, to } = getRange(parsed.page, parsed.pageSize);

  let request = supabase
    .from("orders")
    .select("*", {
      count: "exact",
    })
    .eq("owner_user_id", ownerUserId)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (parsed.q) {
    request = request.or(`order_code.ilike.%${parsed.q}%,product_name.ilike.%${parsed.q}%`);
  }

  if (parsed.status) {
    request = request.eq("status", parsed.status);
  }

  if (parsed.customerId) {
    request = request.eq("customer_id", parsed.customerId);
  }

  const { data, count, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  const items = await mapOrders(supabase, ownerUserId, data ?? []);

  return {
    items,
    q: parsed.q,
    status: parsed.status,
    pagination: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / parsed.pageSize)),
    },
  };
}

export async function listOrdersForCustomer(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  customerId: string,
) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("customer_id", customerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((order) => ({
    ...order,
    status: order.status as OrderListItem["status"],
  }));
}

export async function getOrderById(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [customer, shipment] = await Promise.all([
    supabase
      .from("customers")
      .select("id,name,phone,address")
      .eq("owner_user_id", ownerUserId)
      .eq("id", data.customer_id)
      .single(),
    supabase
      .from("shipments")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("order_id", id)
      .maybeSingle(),
  ]);

  if (customer.error) {
    throw new Error(customer.error.message);
  }

  if (shipment.error) {
    throw new Error(shipment.error.message);
  }

  return {
    ...data,
    status: data.status as OrderListItem["status"],
    customer: customer.data,
    shipment: shipment.data,
  };
}

export async function createOrder(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: OrderFormInput,
) {
  const values = orderFormSchema.parse(input);
  const customerId = await resolveCustomerId(supabase, ownerUserId, values);
  const totalPrice = values.quantity * values.unit_price;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      owner_user_id: ownerUserId,
      order_code: generateOrderCode(),
      customer_id: customerId,
      product_name: values.product_name,
      quantity: values.quantity,
      unit_price: values.unit_price,
      total_price: totalPrice,
      status: values.status,
      note: values.note,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrder(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
  input: OrderFormInput,
) {
  const values = orderFormSchema.parse(input);
  const customerId = await resolveCustomerId(supabase, ownerUserId, values);
  const totalPrice = values.quantity * values.unit_price;

  const { data, error } = await supabase
    .from("orders")
    .update({
      customer_id: customerId,
      product_name: values.product_name,
      quantity: values.quantity,
      unit_price: values.unit_price,
      total_price: totalPrice,
      status: values.status,
      note: values.note,
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

export async function deleteOrder(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
) {
  const { error: shipmentError } = await supabase
    .from("shipments")
    .delete()
    .eq("owner_user_id", ownerUserId)
    .eq("order_id", id);

  if (shipmentError) {
    throw new Error(shipmentError.message);
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("owner_user_id", ownerUserId)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

