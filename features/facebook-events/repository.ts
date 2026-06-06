import type { SupabaseClient } from "@supabase/supabase-js";

import { detectFacebookEventType, extractFacebookFields } from "@/lib/facebook";
import type { Database, Json } from "@/lib/supabase/types";
import { getRange } from "@/lib/utils";

export interface FacebookEventListItem {
  id: string;
  event_type: string;
  payload_json: Json;
  received_at: string;
  extracted: ReturnType<typeof extractFacebookFields>;
}

export async function listFacebookEvents(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  page = 1,
  pageSize = 12,
) {
  const { from, to } = getRange(page, pageSize);
  const { data, count, error } = await supabase
    .from("facebook_events")
    .select("*", {
      count: "exact",
    })
    .eq("owner_user_id", ownerUserId)
    .order("received_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []).map((event) => ({
      ...event,
      extracted: extractFacebookFields(event.payload_json),
    })) as FacebookEventListItem[],
    total: count ?? 0,
    page,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getFacebookEventById(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  eventId: string,
) {
  const { data, error } = await supabase
    .from("facebook_events")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("id", eventId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCustomerEventPrefill(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  eventId: string,
) {
  const event = await getFacebookEventById(supabase, ownerUserId, eventId);
  const extracted = extractFacebookFields(event.payload_json);

  return {
    name: extracted.customerName ?? "",
    phone: extracted.phone ?? "",
    note:
      extracted.textSnippets.length > 0
        ? `Khởi tạo từ sự kiện Facebook ${event.id.slice(0, 8)}\n${extracted.textSnippets.join("\n")}`
        : `Khởi tạo từ sự kiện Facebook ${event.id.slice(0, 8)}`,
  };
}

export async function getOrderEventPrefill(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  eventId: string,
) {
  const event = await getFacebookEventById(supabase, ownerUserId, eventId);
  const extracted = extractFacebookFields(event.payload_json);

  return {
    customer_name: extracted.customerName,
    customer_phone: extracted.phone,
    note:
      extracted.textSnippets.length > 0
        ? `Khởi tạo từ sự kiện Facebook ${event.id.slice(0, 8)}\n${extracted.textSnippets.join("\n")}`
        : `Khởi tạo từ sự kiện Facebook ${event.id.slice(0, 8)}`,
  };
}

export async function getDefaultOwnerUserId(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    throw new Error(
      "Không tìm thấy chủ shop trong public.users. Hãy tạo tài khoản chủ shop trước khi đăng ký webhook.",
    );
  }

  return data.id;
}

export async function createFacebookEventRecord(
  supabase: SupabaseClient<Database>,
  ownerUserId: string,
  payload: Json,
) {
  const eventType = detectFacebookEventType(payload);
  const { data, error } = await supabase
    .from("facebook_events")
    .insert({
      owner_user_id: ownerUserId,
      event_type: eventType,
      payload_json: payload,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
