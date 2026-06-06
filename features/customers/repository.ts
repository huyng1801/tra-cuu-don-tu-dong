import type { SupabaseClient } from "@supabase/supabase-js";

import { getRange } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { customerFormSchema, customersQuerySchema, type CustomerFormInput } from "@/features/customers/schema";

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  facebook_url: string | null;
  created_at: string;
}

export async function listCustomers(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  query: Partial<Record<string, string | string[] | undefined>>,
) {
  const parsed = customersQuerySchema.parse(query);
  const { from, to } = getRange(parsed.page, parsed.pageSize);

  let request = supabase
    .from("customers")
    .select("id,name,phone,facebook_url,created_at", {
      count: "exact",
    })
    .eq("owner_user_id", ownerUserId)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (parsed.q) {
    request = request.or(`name.ilike.%${parsed.q}%,phone.ilike.%${parsed.q}%`);
  }

  const { data, count, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as CustomerListItem[],
    pagination: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / parsed.pageSize)),
    },
    q: parsed.q,
  };
}

export async function getCustomerById(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
): Promise<Database["public"]["Tables"]["customers"]["Row"]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Database["public"]["Tables"]["customers"]["Row"];
}

export async function createCustomer(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  input: CustomerFormInput,
) {
  const values = customerFormSchema.parse(input);
  const { data, error } = await supabase
    .from("customers")
    .insert({
      owner_user_id: ownerUserId,
      ...values,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCustomer(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
  input: CustomerFormInput,
) {
  const values = customerFormSchema.parse(input);
  const { data, error } = await supabase
    .from("customers")
    .update(values)
    .eq("owner_user_id", ownerUserId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCustomer(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  id: string,
) {
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("owner_user_id", ownerUserId)
    .eq("customer_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Không thể xóa khách hàng đã có đơn hàng.");
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("owner_user_id", ownerUserId)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
