import { createHash, timingSafeEqual } from "node:crypto";

export function createCodeHash(code: string, secret: string) {
  return createHash("sha256").update(`${secret}:${code.trim()}`).digest("hex");
}

export function verifyCodeHash(code: string, hash: string, secret: string) {
  const computed = createCodeHash(code, secret);
  const computedBuffer = Buffer.from(computed, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (computedBuffer.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedBuffer, hashBuffer);
}
