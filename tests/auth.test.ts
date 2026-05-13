import { describe, expect, it } from "vitest";
import { createSessionToken, parseSessionToken, type LearnerSession } from "@/src/lib/auth";
import { createCodeHash, verifyCodeHash } from "@/src/lib/crypto";

describe("auth", () => {
  it("matches a code hash for the same trimmed code", async () => {
    const hash = await createCodeHash(" HPMP-2026 ", "secret");

    expect(await verifyCodeHash("HPMP-2026", hash, "secret")).toBe(true);
  });

  it("rejects a code hash for a different code", async () => {
    const hash = await createCodeHash("HPMP-2026", "secret");

    expect(await verifyCodeHash("OTHER-CODE", hash, "secret")).toBe(false);
  });

  it("round trips a learner session token", async () => {
    const session: LearnerSession = {
      role: "learner",
      accessCodeId: "code-1",
      expiresAt: Date.now() + 60_000
    };

    const token = await createSessionToken(session, "secret");

    await expect(parseSessionToken(token, "secret")).resolves.toEqual(session);
  });

  it("rejects tampered tokens with invalid session signature", async () => {
    const session: LearnerSession = {
      role: "learner",
      accessCodeId: "code-1",
      expiresAt: Date.now() + 60_000
    };
    const token = await createSessionToken(session, "secret");
    const [payload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...session, accessCodeId: "code-2" })
    ).toString("base64url");

    await expect(parseSessionToken(`${tamperedPayload}.${signature ?? ""}`, "secret")).rejects.toThrow(
      "Invalid session signature"
    );
    expect(payload).not.toBe(tamperedPayload);
  });
});
