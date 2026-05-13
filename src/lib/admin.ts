import { readAdminSession } from "@/src/lib/cookies";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { AdminSession } from "@/src/lib/auth";

type AdminCodeSessionRow = {
  id: string;
  is_active: boolean;
  expires_at: string;
};

export async function requireActiveAdminSession(): Promise<AdminSession | null> {
  const session = await readAdminSession();

  if (!session) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_codes")
    .select("id,is_active,expires_at")
    .eq("id", session.adminCodeId)
    .maybeSingle();
  const adminCode = data as AdminCodeSessionRow | null;

  if (error || !adminCode?.is_active || new Date(adminCode.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return session;
}
