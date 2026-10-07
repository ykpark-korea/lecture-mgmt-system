import { NextResponse, type NextRequest } from "next/server";
import { requireActiveAdminSession } from "@/src/lib/admin";
import { removeStorageObject } from "@/src/lib/storage";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";
import { artifactSchema, deleteArtifactSchema, reorderArtifactsSchema } from "@/src/lib/validation";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type InsertTable<TPayload> = {
  insert(value: TPayload): {
    select(columns: string): {
      single(): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
};
type DeletedArtifactRow = {
  storage_path: string | null;
};
type ReorderUpdateTable = {
  update(value: { sort_order: number }): {
    eq(column: "id", value: string): {
      eq(column: "lecture_id", value: string): Promise<{ error: { message: string } | null }>;
    };
  };
};

export async function GET(request: NextRequest) {
  if (!(await requireActiveAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lectureId = request.nextUrl.searchParams.get("lectureId");

  if (lectureId && !uuidPattern.test(lectureId)) {
    return NextResponse.json({ error: "Invalid lectureId" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("artifacts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (lectureId) {
    query = query.eq("lecture_id", lectureId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ artifacts: data ?? [] });
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

  const parsed = artifactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid artifact", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const artifact = {
    lecture_id: input.lectureId,
    type: input.type,
    category: input.category,
    title: input.title,
    description: input.description ?? "",
    url: input.url ?? null,
    storage_path: input.storagePath ?? null,
    file_name: input.fileName ?? null,
    is_active: input.isActive,
    sort_order: input.sortOrder
  } satisfies Database["public"]["Tables"]["artifacts"]["Insert"];
  const supabase = createSupabaseServiceClient();
  const artifactsTable = supabase.from("artifacts") as unknown as InsertTable<typeof artifact>;
  const { data, error } = await artifactsTable
    .insert(artifact)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ artifact: data }, { status: 201 });
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

  const parsed = deleteArtifactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid artifact id", issues: parsed.error.issues }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("artifacts")
    .delete()
    .eq("id", parsed.data.id)
    .select("storage_path")
    .maybeSingle();
  const deleted = data as DeletedArtifactRow | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  let storageRemoved = true;

  if (deleted.storage_path) {
    try {
      await removeStorageObject("lecture-artifacts", deleted.storage_path);
    } catch (storageError) {
      storageRemoved = false;
      console.error("Failed to remove artifact file", deleted.storage_path, storageError);
    }
  }

  return NextResponse.json({ ok: true, storageRemoved });
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

  const parsed = reorderArtifactsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid artifact order", issues: parsed.error.issues }, { status: 400 });
  }

  const { lectureId, orderedIds } = parsed.data;
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("artifacts").select("id").eq("lecture_id", lectureId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const currentIds = new Set(((data ?? []) as { id: string }[]).map((row) => row.id));

  if (currentIds.size !== orderedIds.length || orderedIds.some((id) => !currentIds.has(id))) {
    return NextResponse.json({ error: "Artifact list changed" }, { status: 409 });
  }

  const artifactsTable = supabase.from("artifacts") as unknown as ReorderUpdateTable;
  const results = await Promise.all(
    orderedIds.map((id, position) => artifactsTable.update({ sort_order: position }).eq("id", id).eq("lecture_id", lectureId))
  );
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
