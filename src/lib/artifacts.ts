import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Artifact } from "@/src/types/database";

export async function listActiveArtifactsForLecture(lectureId: string): Promise<Artifact[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("lecture_id", lectureId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

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
