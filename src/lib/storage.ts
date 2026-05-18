import { randomUUID } from "node:crypto";
import { createSupabaseServiceClient } from "@/src/lib/supabase";

export type StorageBucket = "lecture-html" | "lecture-artifacts" | "lecture-images";

export function buildStoragePath(bucket: StorageBucket, ownerId: string, fileName: string): string {
  void bucket;

  const normalizedFileName = fileName.normalize("NFKD").toLowerCase();
  const extensionStart = normalizedFileName.lastIndexOf(".");
  const hasExtension = extensionStart >= 0 && extensionStart < normalizedFileName.length - 1;
  const rawBaseName = hasExtension ? normalizedFileName.slice(0, extensionStart) : normalizedFileName;
  const rawExtension = hasExtension ? normalizedFileName.slice(extensionStart + 1) : "";
  const safeBaseName = sanitizeStoragePathPart(rawBaseName);
  const safeExtension = sanitizeStoragePathPart(rawExtension);
  const hasSafeBaseName = /[a-z0-9]/.test(safeBaseName);
  const hasSafeExtension = /[a-z0-9]/.test(safeExtension);

  if (!hasSafeBaseName && !hasSafeExtension) {
    throw new Error("Storage file name must include at least one alphanumeric character");
  }

  const baseName = hasSafeBaseName ? safeBaseName : `file-${hashFileName(fileName)}`;
  const safeName = hasSafeExtension ? `${baseName}.${safeExtension}` : baseName;

  return `${ownerId}/${safeName}`;
}

export function buildUniqueStoragePath(bucket: StorageBucket, ownerId: string, fileName: string): string {
  const path = buildStoragePath(bucket, ownerId, fileName);
  const [owner, safeName] = path.split("/");
  const extensionStart = safeName.lastIndexOf(".");
  const suffix = randomUUID().slice(0, 8);

  if (extensionStart <= 0 || extensionStart === safeName.length - 1) {
    return `${owner}/${safeName}-${suffix}`;
  }

  return `${owner}/${safeName.slice(0, extensionStart)}-${suffix}${safeName.slice(extensionStart)}`;
}

function sanitizeStoragePathPart(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashFileName(fileName: string): string {
  let hash = 0;

  for (const character of fileName.normalize("NFKD")) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), 16777619);
  }

  return (hash >>> 0).toString(36);
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

export async function createPrivateObjectResponse(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 30,
  options: {
    contentType?: string;
    contentDisposition?: "inline" | "attachment";
    fileName?: string;
  } = {}
): Promise<Response> {
  const signedUrl = await createSignedDownloadUrl(bucket, path, expiresInSeconds);
  const upstream = await fetch(signedUrl, { cache: "no-store" });
  const headers = new Headers();

  setNoStoreHeaders(headers);

  if (!upstream.ok || !upstream.body) {
    headers.set("content-type", "application/json");

    return new Response(JSON.stringify({ error: "Asset not found" }), {
      status: upstream.status === 401 || upstream.status === 403 ? 404 : upstream.status,
      headers
    });
  }

  for (const headerName of ["content-type", "content-length", "content-disposition"]) {
    const headerValue = upstream.headers.get(headerName);

    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  if (options.contentType) {
    headers.set("content-type", options.contentType);
  }

  if (options.contentDisposition) {
    headers.set(
      "content-disposition",
      buildContentDisposition(options.contentDisposition, options.fileName ?? path.split("/").pop() ?? "download")
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers
  });
}

function setNoStoreHeaders(headers: Headers) {
  headers.set("cache-control", "no-store, max-age=0");
  headers.set("pragma", "no-cache");
  headers.set("expires", "0");
  headers.set("referrer-policy", "no-referrer");
  headers.set("x-content-type-options", "nosniff");
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

function buildContentDisposition(disposition: "inline" | "attachment", fileName: string) {
  const safeFileName = fileName.replace(/[\\"]/g, "_").replace(/[\r\n]/g, " ").trim() || "download";

  return `${disposition}; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`;
}
