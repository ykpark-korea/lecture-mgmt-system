import { NextResponse, type NextRequest } from "next/server";
import { setAdminSession } from "@/src/lib/cookies";
import { createCodeHash } from "@/src/lib/crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import { adminCodeSchema } from "@/src/lib/validation";

type AdminCodeLoginRow = {
  id: string;
};

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsedCode = adminCodeSchema.safeParse(String(form.get("code") ?? ""));

  if (!parsedCode.success) {
    return redirectTo(request, "/admin/login?error=invalid-code");
  }

  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "SESSION_SECRET is required" }, { status: 500 });
  }

  const codeHash = createCodeHash(parsedCode.data, secret);
  const now = new Date().toISOString();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_codes")
    .select("id")
    .eq("code_hash", codeHash)
    .eq("is_active", true)
    .gte("expires_at", now)
    .maybeSingle();
  const adminCode = data as AdminCodeLoginRow | null;

  if (error || !adminCode) {
    return redirectTo(request, "/admin/login?error=invalid-code");
  }

  await setAdminSession(adminCode.id);

  return redirectTo(request, "/admin");
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}
