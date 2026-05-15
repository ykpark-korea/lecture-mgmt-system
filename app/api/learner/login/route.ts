import { NextResponse, type NextRequest } from "next/server";
import { recordLoginAudit } from "@/src/lib/audit-logs";
import { normalizeAccessCode } from "@/src/lib/code-normalization";
import { setLearnerSession } from "@/src/lib/cookies";
import { createCodeHash } from "@/src/lib/crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { learnerCodeSchema } from "@/src/lib/validation";
import type { LoginAuditResult } from "@/src/types/database";

type AccessCodeLoginRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const normalizedCode = normalizeAccessCode(String(form.get("code") ?? ""));
  const parsedCode = learnerCodeSchema.safeParse(normalizedCode.normalized);

  if (!parsedCode.success) {
    await audit(request, normalizedCode, "invalid_format");
    return redirectTo(request, "/?error=invalid-code");
  }

  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "SESSION_SECRET is required" }, { status: 500 });
  }

  const codeHash = createCodeHash(parsedCode.data, secret);
  const now = new Date();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .select("id, starts_at, ends_at, is_active")
    .eq("code_hash", codeHash)
    .maybeSingle();
  const accessCode = data as AccessCodeLoginRow | null;

  if (error) {
    await audit(request, normalizedCode, "db_error", null, error.message);
    return redirectTo(request, "/?error=invalid-code");
  }

  if (!accessCode) {
    await audit(request, normalizedCode, "not_found");
    return redirectTo(request, "/?error=invalid-code");
  }

  if (!accessCode.is_active) {
    await audit(request, normalizedCode, "inactive", accessCode.id);
    return redirectTo(request, "/?error=invalid-code");
  }

  if (new Date(accessCode.starts_at).getTime() > now.getTime()) {
    await audit(request, normalizedCode, "not_started", accessCode.id);
    return redirectTo(request, "/?error=invalid-code");
  }

  if (new Date(accessCode.ends_at).getTime() < now.getTime()) {
    await audit(request, normalizedCode, "expired", accessCode.id);
    return redirectTo(request, "/?error=invalid-code");
  }

  await audit(request, normalizedCode, "success", accessCode.id);
  await setLearnerSession(accessCode.id);

  return redirectTo(request, "/lectures");
}

async function audit(
  request: NextRequest,
  code: ReturnType<typeof normalizeAccessCode>,
  result: LoginAuditResult,
  accessCodeId?: string | null,
  errorMessage?: string | null
) {
  await recordLoginAudit(request, {
    result,
    normalizedCode: code.normalized,
    normalizedPreview: code.preview,
    inputLength: code.inputLength,
    changedByNormalization: code.changed,
    accessCodeId,
    errorMessage
  });
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}
