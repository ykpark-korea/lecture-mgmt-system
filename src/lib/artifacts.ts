import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Artifact } from "@/src/types/database";

export async function listActiveArtifactsForLecture(lectureId: string): Promise<Artifact[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("lecture_id", lectureId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getArtifact(artifactId: string): Promise<Artifact> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("artifacts").select("*").eq("id", artifactId).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveArtifact(artifactId: string): Promise<Artifact | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("id", artifactId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function getArtifactDownloadName(artifact: Pick<Artifact, "file_name" | "title" | "storage_path">): string {
  const savedName = sanitizeDownloadName(artifact.file_name ?? "");

  if (savedName) {
    return savedName;
  }

  const title = sanitizeDownloadName(artifact.title);
  const extension = getStoredExtension(artifact.storage_path);

  if (!extension || title.toLowerCase().endsWith(extension.toLowerCase())) {
    return title;
  }

  return `${title}${extension}`;
}

function sanitizeDownloadName(value: string) {
  return value.replace(/[\\/\u0000-\u001f\u007f]/g, "_").trim();
}

function getStoredExtension(storagePath: string | null) {
  const fileName = storagePath?.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex > 0 && dotIndex < fileName.length - 1 ? fileName.slice(dotIndex) : "";
}
