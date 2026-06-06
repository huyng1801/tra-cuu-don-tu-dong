import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyFacebookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
) {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const actual = signatureHeader.replace("sha256=", "");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
