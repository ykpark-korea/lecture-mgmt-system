import { NextResponse, type NextRequest } from "next/server";
import { readAdminSession } from "@/src/lib/cookies";
import { buildStoragePath, createSignedUploadUrl, type StorageBucket } from "@/src/lib/storage";
import { isAllowedArtifactFile, isAllowedHtmlFile, isAllowedImageFile } from "@/src/lib/validation";

const storageBuckets = ["lecture-html", "lecture-artifacts", "lecture-images"] as const satisfies readonly StorageBucket[];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UploadRequestBody = {
  bucket?: unknown;
  ownerId?: unknown;
  fileName?: unknown;
};

export async function POST(request: NextRequest) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UploadRequestBody;
  try {
    body = (await request.json()) as UploadRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bucket = typeof body.bucket === "string" ? body.bucket : "";
  const ownerId = typeof body.ownerId === "string" ? body.ownerId.trim() : "";
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";

  if (!isStorageBucket(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (!uuidPattern.test(ownerId)) {
    return NextResponse.json({ error: "Invalid ownerId" }, { status: 400 });
  }

  if (!fileName || fileName.length > 200 || fileName.includes("/") || fileName.includes("\\")) {
    return NextResponse.json({ error: "Invalid fileName" }, { status: 400 });
  }

  if (!isAllowedUpload(bucket, fileName)) {
    return NextResponse.json({ error: "File type is not allowed for this bucket" }, { status: 400 });
  }

  try {
    const path = buildStoragePath(bucket, ownerId, fileName);
    const upload = await createSignedUploadUrl(bucket, path);

    return NextResponse.json({ path, upload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create upload URL";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isStorageBucket(value: string): value is StorageBucket {
  return storageBuckets.includes(value as StorageBucket);
}

function isAllowedUpload(bucket: StorageBucket, fileName: string) {
  if (bucket === "lecture-html") {
    return isAllowedHtmlFile(fileName);
  }

  if (bucket === "lecture-images") {
    return isAllowedImageFile(fileName);
  }

  return isAllowedArtifactFile(fileName);
}
