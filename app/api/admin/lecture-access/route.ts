import { NextResponse, type NextRequest } from "next/server";
import { requireActiveAdminSession } from "@/src/lib/admin";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";
import { linkLectureAccessCodeSchema } from "@/src/lib/validation";

const lectureAccessSelect = "id,lecture_id,access_code_id,sort_order,created_at";
const unlinkLectureAccessCodeSchema = linkLectureAccessCodeSchema.omit({ sortOrder: true });

type UpsertTable<TPayload> = {
  upsert(value: TPayload, options: { onConflict: string }): {
    select(columns: string): {
      single(): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
};

export async function GET() {
  if (!(await requireActiveAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lecture_access_codes")
    .select(lectureAccessSelect)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ links: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await requireActiveAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = linkLectureAccessCodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lecture access link", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const link = {
    lecture_id: input.lectureId,
    access_code_id: input.accessCodeId,
    sort_order: input.sortOrder
  } satisfies Database["public"]["Tables"]["lecture_access_codes"]["Insert"];
  const supabase = createSupabaseServiceClient();
  const lectureAccessTable = supabase.from("lecture_access_codes") as unknown as UpsertTable<typeof link>;
  const { data, error } = await lectureAccessTable
    .upsert(link, { onConflict: "lecture_id,access_code_id" })
    .select(lectureAccessSelect)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireActiveAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = unlinkLectureAccessCodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lecture access link", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("lecture_access_codes")
    .delete()
    .eq("lecture_id", input.lectureId)
    .eq("access_code_id", input.accessCodeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
