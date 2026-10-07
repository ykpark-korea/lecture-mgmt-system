import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/artifacts/[artifactId]/signed-url/route";

const readLearnerSession = vi.fn();
const getActiveArtifact = vi.fn();
const getAuthorizedLecture = vi.fn();
const createPrivateObjectResponse = vi.fn();

vi.mock("@/src/lib/cookies", () => ({
  readLearnerSession: () => readLearnerSession()
}));

vi.mock("@/src/lib/artifacts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/lib/artifacts")>()),
  getActiveArtifact: (id: string) => getActiveArtifact(id)
}));

vi.mock("@/src/lib/lectures", () => ({
  getAuthorizedLecture: (...args: unknown[]) => getAuthorizedLecture(...args)
}));

vi.mock("@/src/lib/storage", () => ({
  createPrivateObjectResponse: (...args: unknown[]) => createPrivateObjectResponse(...args)
}));

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: () => ({})
}));

const artifactId = "33333333-3333-4333-8333-333333333333";
const lectureId = "22222222-2222-4222-8222-222222222222";

const baseArtifact = {
  id: artifactId,
  lecture_id: lectureId,
  type: "file",
  category: "practice",
  title: "AX_실습_따라하기",
  description: "",
  url: null,
  storage_path: `${lectureId}/ax-b190e66a.html`,
  file_name: null,
  is_active: true,
  sort_order: 0
};

function callRoute() {
  return GET(new NextRequest(`http://localhost/api/artifacts/${artifactId}/signed-url`), {
    params: Promise.resolve({ artifactId })
  });
}

describe("GET /api/artifacts/[artifactId]/signed-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readLearnerSession.mockResolvedValue({ role: "learner", accessCodeId: "code-1", expiresAt: Date.now() + 1000 });
    getAuthorizedLecture.mockResolvedValue({ id: lectureId });
    createPrivateObjectResponse.mockResolvedValue(new Response("file"));
  });

  it("downloads under the original file name saved at upload time", async () => {
    getActiveArtifact.mockResolvedValueOnce({ ...baseArtifact, file_name: "AX 실습 따라하기.html" });

    await callRoute();

    expect(createPrivateObjectResponse).toHaveBeenCalledWith("lecture-artifacts", `${lectureId}/ax-b190e66a.html`, 30, {
      contentDisposition: "attachment",
      fileName: "AX 실습 따라하기.html"
    });
  });

  it("downloads materials without a saved file name as title plus extension instead of the storage name", async () => {
    getActiveArtifact.mockResolvedValueOnce(baseArtifact);

    await callRoute();

    expect(createPrivateObjectResponse).toHaveBeenCalledWith("lecture-artifacts", `${lectureId}/ax-b190e66a.html`, 30, {
      contentDisposition: "attachment",
      fileName: "AX_실습_따라하기.html"
    });
  });

  it("does not serve a file to learners without a session", async () => {
    readLearnerSession.mockResolvedValueOnce(null);

    const response = await callRoute();

    expect(response.status).toBe(401);
    expect(createPrivateObjectResponse).not.toHaveBeenCalled();
  });
});
