import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database, LoginAuditResult } from "@/src/types/database";

type InsertTable<TPayload> = {
  insert(value: TPayload): Promise<{ error: { message: string } | null }>;
};

export type LoginAuditInput = {
  result: LoginAuditResult;
  normalizedCode: string;
  normalizedPreview: string;
  inputLength: number;
  changedByNormalization: boolean;
  accessCodeId?: string | null;
  errorMessage?: string | null;
};

export async function recordLoginAudit(request: NextRequest, input: LoginAuditInput) {
  try {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      return;
    }

    const audit = {
      result: input.result,
      access_code_id: input.accessCodeId ?? null,
      code_fingerprint: fingerprint(input.normalizedCode, secret, "code"),
      normalized_preview: input.normalizedPreview || null,
      input_length: input.inputLength,
      changed_by_normalization: input.changedByNormalization,
      user_agent: request.headers.get("user-agent"),
      ip_hash: fingerprint(getClientIp(request), secret, "ip"),
      request_region: request.headers.get("x-vercel-id")?.split("::")[0] ?? request.headers.get("x-vercel-ip-country-region"),
      error_message: input.errorMessage?.slice(0, 300) ?? null
    } satisfies Database["public"]["Tables"]["login_audit_logs"]["Insert"];

    const supabase = createSupabaseServiceClient();
    const table = supabase.from("login_audit_logs") as unknown as InsertTable<typeof audit>;
    const { error } = await table.insert(audit);

    if (error) {
      console.error("Failed to record login audit", error.message);
    }
  } catch (error) {
    console.error("Failed to record login audit", error);
  }
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

function fingerprint(value: string, secret: string, scope: string) {
  return createHash("sha256").update(`${scope}:${secret}:${value}`).digest("hex").slice(0, 24);
}
