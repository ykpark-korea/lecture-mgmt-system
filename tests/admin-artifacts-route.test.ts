import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, PATCH, POST } from "@/app/api/admin/artifacts/route";

const requireActiveAdminSession = vi.fn();
const removeStorageObject = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ select: () => ({ maybeSingle }) }));
const deleteRows = vi.fn(() => ({ eq }));
const insertSingle = vi.fn();
const insert = vi.fn(() => ({ select: () => ({ single: insertSingle }) }));
const listLectureArtifacts = vi.fn();
const orderSpy = vi.fn();
const listQuery: Record<string, unknown> = {
  then: (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null })
};
listQuery.order = (...args: unknown[]) => {
  orderSpy(...args);
  return listQuery;
};
const selectRows = vi.fn(() => ({ eq: listLectureArtifacts, order: listQuery.order }));
const updateLectureEq = vi.fn();
const updateIdEq = vi.fn(() => ({ eq: updateLectureEq }));
const update = vi.fn(() => ({ eq: updateIdEq }));
const from = vi.fn(() => ({ delete: deleteRows, insert, select: selectRows, update }));

vi.mock("@/src/lib/admin", () => ({
  requireActiveAdminSession: () => requireActiveAdminSession()
}));

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: () => ({ from })
}));

vi.mock("@/src/lib/storage", () => ({
  removeStorageObject: (bucket: string, path: string) => removeStorageObject(bucket, path)
}));

const artifactId = "33333333-3333-4333-8333-333333333333";
const lectureId = "22222222-2222-4222-8222-222222222222";

const fileArtifact = {
  id: artifactId,
  lecture_id: lectureId,
  type: "file",
  category: "practice",
  title: "실습 교안",
  description: "",
  url: null,
  storage_path: `${lectureId}/guide.pdf`,
  is_active: true,
  sort_order: 0
};

const linkArtifact = { ...fileArtifact, type: "link", url: "https://example.com/guide", storage_path: null };

function deleteRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/artifacts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("DELETE /api/admin/artifacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireActiveAdminSession.mockResolvedValue({ role: "admin", adminCodeId: "admin-1", expiresAt: Date.now() + 1000 });
    removeStorageObject.mockResolvedValue(undefined);
  });

  it("rejects requests without an active admin session before touching the database", async () => {
    requireActiveAdminSession.mockResolvedValueOnce(null);

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
    expect(removeStorageObject).not.toHaveBeenCalled();
  });

  it("rejects a request body that is not valid JSON", async () => {
    const response = await DELETE(
      new NextRequest("http://localhost/api/admin/artifacts", { method: "DELETE", body: "not json" })
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an id that is not a uuid", async () => {
    const response = await DELETE(deleteRequest({ id: "not-a-uuid" }));

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 404 when no artifact has that id", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(404);
    expect(removeStorageObject).not.toHaveBeenCalled();
  });

  it("returns 500 and keeps the stored file when the database delete fails", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "db down" } });

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(500);
    expect(removeStorageObject).not.toHaveBeenCalled();
  });

  it("deletes the row first, then removes the stored file of a file artifact", async () => {
    maybeSingle.mockResolvedValueOnce({ data: fileArtifact, error: null });

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, storageRemoved: true });
    expect(from).toHaveBeenCalledWith("artifacts");
    expect(eq).toHaveBeenCalledWith("id", artifactId);
    expect(removeStorageObject).toHaveBeenCalledWith("lecture-artifacts", `${lectureId}/guide.pdf`);
    expect(maybeSingle.mock.invocationCallOrder[0]).toBeLessThan(removeStorageObject.mock.invocationCallOrder[0]);
  });

  it("does not touch storage when deleting a link artifact", async () => {
    maybeSingle.mockResolvedValueOnce({ data: linkArtifact, error: null });

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, storageRemoved: true });
    expect(removeStorageObject).not.toHaveBeenCalled();
  });

  it("still succeeds but reports the leftover file when storage removal fails after the row is gone", async () => {
    maybeSingle.mockResolvedValueOnce({ data: fileArtifact, error: null });
    removeStorageObject.mockRejectedValueOnce(new Error("storage unavailable"));

    const response = await DELETE(deleteRequest({ id: artifactId }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, storageRemoved: false });
  });
});

describe("POST /api/admin/artifacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireActiveAdminSession.mockResolvedValue({ role: "admin", adminCodeId: "admin-1", expiresAt: Date.now() + 1000 });
  });

  function postRequest(body: unknown) {
    return new NextRequest("http://localhost/api/admin/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }

  it("saves the original file name of an uploaded file so downloads can keep it", async () => {
    insertSingle.mockResolvedValueOnce({ data: { ...fileArtifact, file_name: "원본 파일.zip" }, error: null });

    const response = await POST(
      postRequest({
        lectureId,
        type: "file",
        category: "practice",
        title: "실습",
        storagePath: `${lectureId}/practice-1a2b3c4d.zip`,
        fileName: "원본 파일.zip"
      })
    );

    expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ storage_path: `${lectureId}/practice-1a2b3c4d.zip`, file_name: "원본 파일.zip" })
    );
  });

  it("stores no file name for link artifacts", async () => {
    insertSingle.mockResolvedValueOnce({ data: linkArtifact, error: null });

    await POST(
      postRequest({ lectureId, type: "link", category: "external", title: "링크", url: "https://example.com/guide" })
    );

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ file_name: null }));
  });
});

describe("GET /api/admin/artifacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireActiveAdminSession.mockResolvedValue({ role: "admin", adminCodeId: "admin-1", expiresAt: Date.now() + 1000 });
  });

  it("lists artifacts by sort_order and breaks ties by creation time so the order does not jump between loads", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/artifacts"));

    expect(response.status).toBe(200);
    expect(orderSpy.mock.calls).toEqual([
      ["sort_order", { ascending: true }],
      ["created_at", { ascending: true }]
    ]);
  });
});

describe("PATCH /api/admin/artifacts (reorder)", () => {
  const [idA, idB, idC] = [
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
  ];

  function patchRequest(body: unknown) {
    return new NextRequest("http://localhost/api/admin/artifacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    requireActiveAdminSession.mockResolvedValue({ role: "admin", adminCodeId: "admin-1", expiresAt: Date.now() + 1000 });
    listLectureArtifacts.mockResolvedValue({ data: [{ id: idA }, { id: idB }, { id: idC }], error: null });
    updateLectureEq.mockResolvedValue({ error: null });
  });

  it("rejects requests without an active admin session before touching the database", async () => {
    requireActiveAdminSession.mockResolvedValueOnce(null);

    const response = await PATCH(patchRequest({ lectureId, orderedIds: [idA, idB, idC] }));

    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it.each([
    { name: "a missing lectureId", body: { orderedIds: [idA] } },
    { name: "an empty list", body: { lectureId, orderedIds: [] } },
    { name: "a non-uuid id", body: { lectureId, orderedIds: ["nope"] } },
    { name: "a duplicated id", body: { lectureId, orderedIds: [idA, idA, idB] } }
  ])("rejects $name", async ({ body }) => {
    const response = await PATCH(patchRequest(body));

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    { name: "leaves out an artifact of the lecture", orderedIds: [idA, idB] },
    { name: "includes an artifact that is not in the lecture", orderedIds: [idA, idB, idC, "dddddddd-dddd-4ddd-8ddd-dddddddddddd"] }
  ])("returns 409 and changes nothing when the list $name", async ({ orderedIds }) => {
    const response = await PATCH(patchRequest({ lectureId, orderedIds }));

    expect(response.status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it("renumbers the lecture's artifacts 0..n-1 in the requested order", async () => {
    const response = await PATCH(patchRequest({ lectureId, orderedIds: [idC, idA, idB] }));

    expect(response.status).toBe(200);
    expect(listLectureArtifacts).toHaveBeenCalledWith("lecture_id", lectureId);
    expect(update.mock.calls).toEqual([[{ sort_order: 0 }], [{ sort_order: 1 }], [{ sort_order: 2 }]]);
    expect(updateIdEq.mock.calls).toEqual([["id", idC], ["id", idA], ["id", idB]]);
    expect(updateLectureEq.mock.calls).toEqual([
      ["lecture_id", lectureId],
      ["lecture_id", lectureId],
      ["lecture_id", lectureId]
    ]);
  });

  it("returns 500 when the artifact list cannot be read", async () => {
    listLectureArtifacts.mockResolvedValueOnce({ data: null, error: { message: "db down" } });

    const response = await PATCH(patchRequest({ lectureId, orderedIds: [idA, idB, idC] }));

    expect(response.status).toBe(500);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns 500 when any renumbering update fails", async () => {
    updateLectureEq.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: { message: "db down" } });

    const response = await PATCH(patchRequest({ lectureId, orderedIds: [idA, idB, idC] }));

    expect(response.status).toBe(500);
  });
});
