import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireActiveAdminSession } from "@/src/lib/admin";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";
import { createLectureSchema, updateLectureSchema } from "@/src/lib/validation";

type InsertTable<TPayload> = {
  insert(value: TPayload): {
    select(columns: string): {
      single(): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
};
type UpdateTable<TPayload> = {
  update(value: TPayload): {
    eq(column: "id", value: string): {
      select(columns: string): {
        maybeSingle(): Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
  };
};

const updateLectureRequestSchema = z.object({ id: z.string().uuid() }).passthrough();

export async function GET() {
  if (!(await requireActiveAdminSession())) {
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
  if (!(await requireActiveAdminSession())) {
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
  const materialStoragePath = input.materialStoragePath ?? input.htmlStoragePath ?? null;
  const materialType = input.materialType ?? (input.htmlStoragePath ? "html" : "html");
  const lecture = {
    title: input.title,
    description: input.description,
    status: input.status,
    html_storage_path: materialType === "html" ? materialStoragePath : null,
    material_type: materialType,
    material_storage_path: materialStoragePath,
    display_pdf_storage_path: input.displayPdfStoragePath ?? null,
    thumbnail_storage_path: input.thumbnailStoragePath ?? null,
    uses_default_hero: input.usesDefaultHero,
    published_starts_at: input.publishedStartsAt ?? null,
    published_ends_at: input.publishedEndsAt ?? null,
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

export async function PATCH(request: NextRequest) {
  if (!(await requireActiveAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestParsed = updateLectureRequestSchema.safeParse(body);

  if (!requestParsed.success) {
    return NextResponse.json({ error: "Invalid lecture update", issues: requestParsed.error.issues }, { status: 400 });
  }

  const { id, ...rawUpdate } = requestParsed.data;
  const parsed = updateLectureSchema.safeParse(rawUpdate);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lecture update", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const materialType = input.materialType;
  const materialStoragePath = input.materialStoragePath;
  const nextHtmlStoragePath =
    (materialType ?? (input.htmlStoragePath ? "html" : undefined)) === "html"
      ? materialStoragePath ?? input.htmlStoragePath ?? null
      : null;
  const lectureUpdate = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(materialType !== undefined ? { material_type: materialType } : {}),
    ...(materialStoragePath !== undefined ? { material_storage_path: materialStoragePath } : {}),
    ...(input.displayPdfStoragePath !== undefined ? { display_pdf_storage_path: input.displayPdfStoragePath } : {}),
    ...(input.htmlStoragePath !== undefined || materialStoragePath !== undefined || materialType !== undefined
      ? { html_storage_path: nextHtmlStoragePath }
      : {}),
    ...(input.thumbnailStoragePath !== undefined ? { thumbnail_storage_path: input.thumbnailStoragePath } : {}),
    ...(input.usesDefaultHero !== undefined ? { uses_default_hero: input.usesDefaultHero } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    ...(input.publishedStartsAt !== undefined ? { published_starts_at: input.publishedStartsAt } : {}),
    ...(input.publishedEndsAt !== undefined ? { published_ends_at: input.publishedEndsAt } : {})
  } satisfies Database["public"]["Tables"]["lectures"]["Update"];
  const supabase = createSupabaseServiceClient();
  const lecturesTable = supabase.from("lectures") as unknown as UpdateTable<typeof lectureUpdate>;
  const { data, error } = await lecturesTable
    .update(lectureUpdate)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  return NextResponse.json({ lecture: data });
}
