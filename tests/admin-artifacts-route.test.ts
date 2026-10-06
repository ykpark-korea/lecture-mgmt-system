import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/admin/artifacts/route";

const requireActiveAdminSession = vi.fn();
const removeStorageObject = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ select: () => ({ maybeSingle }) }));
const deleteRows = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ delete: deleteRows }));

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
