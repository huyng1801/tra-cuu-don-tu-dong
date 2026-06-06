import { jsonError } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { verifyFacebookSignature } from "@/lib/facebook-webhook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createFacebookEventRecord, getDefaultOwnerUserId } from "@/features/facebook-events/repository";

export async function GET(request: Request) {
  const env = getServerEnv();
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && verifyToken === env.FACEBOOK_VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!verifyFacebookSignature(rawBody, signatureHeader, env.FACEBOOK_APP_SECRET)) {
      return new Response("Invalid signature", {
        status: 401,
      });
    }

    const payload = JSON.parse(rawBody);
    const admin = createSupabaseAdminClient();
    const ownerUserId = await getDefaultOwnerUserId(admin);
    await createFacebookEventRecord(admin, ownerUserId, payload);

    return new Response("EVENT_RECEIVED", {
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Webhook Facebook xu ly that bai.",
      500,
    );
  }
}
