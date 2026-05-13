import { NextResponse, type NextRequest } from "next/server";
import { readAdminSession } from "@/src/lib/cookies";
import { createCodeHash } from "@/src/lib/crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";
import { createAccessCodeSchema } from "@/src/lib/validation";

const accessCodeSelect = "id,name,starts_at,ends_at,is_active,notes,created_at,updated_at";
type InsertTable<TPayload> = {
  insert(value: TPayload): {
    select(columns: string): {
      single(): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
};

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .select(accessCodeSelect)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ codes: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "SESSION_SECRET is required" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createAccessCodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid access code", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const accessCode = {
    name: input.name,
    code_hash: createCodeHash(input.code, secret),
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    is_active: input.isActive,
    notes: input.notes ?? null
  } satisfies Database["public"]["Tables"]["access_codes"]["Insert"];
  const supabase = createSupabaseServiceClient();
  const accessCodesTable = supabase.from("access_codes") as unknown as InsertTable<typeof accessCode>;
  const { data, error } = await accessCodesTable
    .insert(accessCode)
    .select(accessCodeSelect)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}
