import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

import { GET, POST } from "@/app/api/webhook/facebook/route";
import { verifyFacebookSignature } from "@/lib/facebook-webhook";

const mocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  getDefaultOwnerUserId: vi.fn(),
  createFacebookEventRecord: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

vi.mock("@/features/facebook-events/repository", () => ({
  getDefaultOwnerUserId: mocks.getDefaultOwnerUserId,
  createFacebookEventRecord: mocks.createFacebookEventRecord,
}));

describe("facebook webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.FACEBOOK_VERIFY_TOKEN = "verify-token";
    process.env.FACEBOOK_APP_ID = "app-id";
    process.env.FACEBOOK_APP_SECRET = "secret";
  });

  it("verifies webhook challenge", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=12345",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("12345");
  });

  it("rejects wrong verify token", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
      ),
    );

    expect(response.status).toBe(403);
  });

  it("verifies signature helper", () => {
    const rawBody = JSON.stringify({ hello: "world" });
    const signature = createHmac("sha256", "secret").update(rawBody).digest("hex");

    expect(verifyFacebookSignature(rawBody, `sha256=${signature}`, "secret")).toBe(true);
    expect(verifyFacebookSignature(rawBody, "sha256=bad", "secret")).toBe(false);
  });

  it("stores payload when signature is valid", async () => {
    const payload = { object: "page", entry: [{ id: "1" }] };
    const rawBody = JSON.stringify(payload);
    const signature = createHmac("sha256", "secret").update(rawBody).digest("hex");
    mocks.createSupabaseAdminClient.mockReturnValue({ fake: true });
    mocks.getDefaultOwnerUserId.mockResolvedValue("owner-1");
    mocks.createFacebookEventRecord.mockResolvedValue({ id: "event-1" });

    const response = await POST(
      new Request("http://localhost/api/webhook/facebook", {
        method: "POST",
        headers: {
          "x-hub-signature-256": `sha256=${signature}`,
        },
        body: rawBody,
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getDefaultOwnerUserId).toHaveBeenCalled();
    expect(mocks.createFacebookEventRecord).toHaveBeenCalledWith(
      { fake: true },
      "owner-1",
      payload,
    );
  });
});
