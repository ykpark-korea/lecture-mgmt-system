import { cookies } from "next/headers";
import {
  createSessionToken,
  parseSessionToken,
  type AdminSession,
  type AppSession,
  type LearnerSession
} from "@/src/lib/auth";

export const learnerCookieName = "hanwha_learner_session";
export const adminCookieName = "hanwha_admin_session";

export function sessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }

  return secret;
}

export async function setLearnerSession(accessCodeId: string) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const session: LearnerSession = { role: "learner", accessCodeId, expiresAt };
  const token = await createSessionToken(session, sessionSecret());
  const store = await cookies();

  store.set(learnerCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function setAdminSession(adminCodeId: string) {
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  const session: AdminSession = { role: "admin", adminCodeId, expiresAt };
  const token = await createSessionToken(session, sessionSecret());
  const store = await cookies();

  store.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function readSession(name: string): Promise<AppSession | null> {
  const store = await cookies();
  const token = store.get(name)?.value;

  if (!token) {
    return null;
  }

  try {
    return await parseSessionToken(token, sessionSecret());
  } catch {
    return null;
  }
}

export async function readLearnerSession(): Promise<LearnerSession | null> {
  const session = await readSession(learnerCookieName);

  if (session?.role !== "learner") {
    return null;
  }

  return session;
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const session = await readSession(adminCookieName);

  if (session?.role !== "admin") {
    return null;
  }

  return session;
}
