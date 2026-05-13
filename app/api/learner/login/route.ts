import { NextResponse, type NextRequest } from "next/server";
import { setLearnerSession } from "@/src/lib/cookies";
import { createCodeHash } from "@/src/lib/crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { learnerCodeSchema } from "@/src/lib/validation";

type AccessCodeLoginRow = {
  id: string;
};

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsedCode = learnerCodeSchema.safeParse(String(form.get("code") ?? ""));

  if (!parsedCode.success) {
    return redirectTo(request, "/?error=invalid-code");
  }

  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "SESSION_SECRET is required" }, { status: 500 });
  }

  const codeHash = createCodeHash(parsedCode.data, secret);
  const now = new Date().toISOString();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .select("id")
    .eq("code_hash", codeHash)
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .maybeSingle();
  const accessCode = data as AccessCodeLoginRow | null;

  if (error || !accessCode) {
    return redirectTo(request, "/?error=invalid-code");
  }

  await setLearnerSession(accessCode.id);

  return redirectTo(request, "/lectures");
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}
