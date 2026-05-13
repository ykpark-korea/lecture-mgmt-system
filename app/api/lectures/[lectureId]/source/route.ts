import { NextResponse, type NextRequest } from "next/server";
import { readLearnerSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";
import { getLectureMaterialContentType } from "@/src/lib/materials";
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
  const materialType = lecture?.material_type ?? "html";
  const materialStoragePath = lecture?.material_storage_path ?? lecture?.html_storage_path;

  if (!lecture || !materialStoragePath) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  return createPrivateObjectResponse("lecture-html", materialStoragePath, 30, {
    contentType: getLectureMaterialContentType(materialType),
    contentDisposition: "attachment"
  });
}
