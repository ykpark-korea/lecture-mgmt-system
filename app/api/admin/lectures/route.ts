import { NextResponse, type NextRequest } from "next/server";
import { readAdminSession } from "@/src/lib/cookies";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";
import { createLectureSchema } from "@/src/lib/validation";

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
  const { data, error } = await supabase.from("lectures").select("*").order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lectures: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createLectureSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lecture", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const lecture = {
    title: input.title,
    description: input.description,
    status: input.status,
    html_storage_path: input.htmlStoragePath ?? null,
    thumbnail_storage_path: input.thumbnailStoragePath ?? null,
    uses_default_hero: input.usesDefaultHero,
    sort_order: input.sortOrder
  } satisfies Database["public"]["Tables"]["lectures"]["Insert"];
  const supabase = createSupabaseServiceClient();
  const lecturesTable = supabase.from("lectures") as unknown as InsertTable<typeof lecture>;
  const { data, error } = await lecturesTable
    .insert(lecture)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lecture: data }, { status: 201 });
}
