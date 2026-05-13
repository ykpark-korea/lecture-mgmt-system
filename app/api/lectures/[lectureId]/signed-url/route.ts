import { NextResponse, type NextRequest } from "next/server";
import { readLearnerSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { getLectureMaterialContentType, type LectureMaterialType } from "@/src/lib/materials";
import { createPrivateObjectResponse } from "@/src/lib/storage";

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

  if (!lecture) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  const materialType = lecture.material_type ?? "html";
  const materialStoragePath = lecture.material_storage_path ?? lecture.html_storage_path;
  const displayPath = materialType === "ppt" || materialType === "pptx"
    ? lecture.display_pdf_storage_path
    : lecture.display_pdf_storage_path ?? materialStoragePath;

  if (!displayPath) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  const displayType: LectureMaterialType = displayPath.toLowerCase().endsWith(".pdf") ? "pdf" : materialType;

  return createPrivateObjectResponse("lecture-html", displayPath, 30, {
    contentType: getLectureMaterialContentType(displayType),
    contentDisposition: "inline"
  });
}
