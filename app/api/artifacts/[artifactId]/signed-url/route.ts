import { NextResponse, type NextRequest } from "next/server";
import { getActiveArtifact } from "@/src/lib/artifacts";
import { readLearnerSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { createSignedDownloadUrl } from "@/src/lib/storage";

type RouteContext = {
  params: Promise<{ artifactId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  void request;

  const session = await readLearnerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { artifactId } = await context.params;
  const artifact = await getActiveArtifact(artifactId);

  if (!artifact || artifact.type !== "file" || !artifact.storage_path) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const lecture = await getAuthorizedLecture(session.accessCodeId, artifact.lecture_id);

  if (!lecture) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const signedUrl = await createSignedDownloadUrl("lecture-artifacts", artifact.storage_path);

  return NextResponse.redirect(signedUrl);
}
