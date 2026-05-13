import { createHmac, timingSafeEqual } from "node:crypto";

export type LearnerSession = {
  role: "learner";
  accessCodeId: string;
  expiresAt: number;
};

export type AdminSession = {
  role: "admin";
  adminCodeId: string;
  expiresAt: number;
};

export type AppSession = LearnerSession | AdminSession;

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verifySignature(signature: string, expected: string) {
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function createSessionToken(session: AppSession, secret: string) {
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = sign(payload, secret);

  return `${payload}.${signature}`;
}

export async function parseSessionToken(token: string, secret: string): Promise<AppSession> {
  const [payload, signature, extra] = token.split(".");

  if (!payload || !signature || extra !== undefined) {
    throw new Error("Invalid session token");
  }

  const expectedSignature = sign(payload, secret);
  if (!verifySignature(signature, expectedSignature)) {
    throw new Error("Invalid session signature");
  }

  let session: AppSession;
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
  } catch {
    throw new Error("Invalid session token");
  }

  if (session.expiresAt <= Date.now()) {
    throw new Error("Session expired");
  }

  return session;
}
