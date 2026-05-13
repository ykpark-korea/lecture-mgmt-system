import { createSupabaseServiceClient } from "@/src/lib/supabase";

export type StorageBucket = "lecture-html" | "lecture-artifacts" | "lecture-images";

export function buildStoragePath(bucket: StorageBucket, ownerId: string, fileName: string): string {
  void bucket;

  const safeName = fileName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!/[a-z0-9]/.test(safeName)) {
    throw new Error("Storage file name must include at least one alphanumeric character");
  }

  return `${ownerId}/${safeName}`;
}

export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 600
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw error;
  }

  if (!data?.signedUrl) {
    throw new Error("Failed to create signed download URL");
  }

  return data.signedUrl;
}

export async function createSignedUploadUrl(bucket: StorageBucket, path: string): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error) {
    throw error;
  }

  if (!data?.signedUrl) {
    throw new Error("Failed to create signed upload URL");
  }

  return data.signedUrl;
}
