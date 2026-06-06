import type { Json } from "@/lib/supabase/types";

export interface FacebookExtractedFields {
  customerName: string | null;
  phone: string | null;
  trackingCode: string | null;
  textSnippets: string[];
}

const phonePattern =
  /(?:\+?84|0)(?:\s|\.)?(?:\d(?:\s|\.)?){8,10}/g;

const trackingPattern = /\b[A-Z0-9]{8,20}\b/g;

function walkPayload(value: Json, collector: string[]) {
  if (typeof value === "string") {
    collector.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => walkPayload(item, collector));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => {
      if (item !== undefined) {
        walkPayload(item, collector);
      }
    });
  }
}

export function detectFacebookEventType(payload: Json) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "unknown";
  }

  const payloadObject = payload as Record<string, Json | undefined>;
  const entry = Array.isArray(payloadObject.entry)
    ? (payloadObject.entry[0] as Record<string, Json | undefined> | undefined)
    : null;
  const firstChange = Array.isArray(entry?.changes)
    ? (entry.changes[0] as Record<string, Json | undefined> | undefined)
    : null;

  return (
    (typeof firstChange?.field === "string" ? firstChange.field : null) ??
    (entry?.messaging ? "messaging" : null) ??
    (typeof payloadObject.object === "string" ? payloadObject.object : null) ??
    "unknown"
  );
}

export function extractFacebookFields(payload: Json): FacebookExtractedFields {
  const strings: string[] = [];
  walkPayload(payload, strings);

  const normalized = strings
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);

  const phone = normalized
    .flatMap((item) => item.match(phonePattern) ?? [])
    .map((item) => item.replace(/\D/g, ""))
    .find(Boolean);

  const trackingCode = normalized
    .flatMap((item) => item.match(trackingPattern) ?? [])
    .find((value) => value.length >= 8);

  const customerName =
    normalized.find((item) => /^([A-ZÀ-ỹ][\p{L}\s'.-]{2,})$/u.test(item)) ?? null;

  return {
    customerName,
    phone: phone ?? null,
    trackingCode: trackingCode ?? null,
    textSnippets: normalized.slice(0, 6),
  };
}
