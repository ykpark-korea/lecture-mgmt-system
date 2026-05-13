import { NextResponse, type NextRequest } from "next/server";
import { readLearnerSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { createSignedDownloadUrl } from "@/src/lib/storage";

type RouteContext = {
  params: Promise<{ lectureId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  void request;

  const session = await readLearnerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lectureId } = await context.params;
  const lecture = await getAuthorizedLecture(session.accessCodeId, lectureId);

  if (!lecture?.html_storage_path) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  const signedUrl = await createSignedDownloadUrl("lecture-html", lecture.html_storage_path);

  return NextResponse.redirect(signedUrl);
}
