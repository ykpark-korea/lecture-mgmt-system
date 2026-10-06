import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildStoragePath,
  buildUniqueStoragePath,
  createPrivateObjectResponse,
  removeStorageObject
} from "@/src/lib/storage";

const createSignedUrl = vi.fn();
const remove = vi.fn();
const storageFrom = vi.fn();

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: () => ({
    storage: {
      from: (bucket: string) => {
        storageFrom(bucket);

        return { createSignedUrl, remove };
      }
    }
  })
}));

describe("storage", () => {
  beforeEach(() => {
    storageFrom.mockClear();
    remove.mockClear();
  });

  it("builds safe storage paths for owner files", () => {
    expect(buildStoragePath("lecture-html", "lecture-1", "HPMP high.html")).toBe(
      "lecture-1/hpmp-high.html"
    );
  });

  it("rejects empty normalized file names", () => {
    expect(() => buildStoragePath("lecture-html", "lecture-1", "   ")).toThrow(
      "Storage file name must include at least one alphanumeric character"
    );
  });

  it("rejects dot-only normalized file names", () => {
    expect(() => buildStoragePath("lecture-html", "lecture-1", "...")).toThrow(
      "Storage file name must include at least one alphanumeric character"
    );
  });

  it("uses a deterministic basename fallback for non-Latin filenames with extensions", () => {
    const path = buildStoragePath("lecture-artifacts", "lecture-1", "자료.pdf");

    expect(path).toMatch(/^lecture-1\/file-[a-z0-9]+\.pdf$/);
    expect(path).not.toBe("lecture-1/.pdf");
    expect(buildStoragePath("lecture-artifacts", "lecture-1", "자료.pdf")).toBe(path);
  });

  it("uses a deterministic basename fallback for punctuation-only filenames with extensions", () => {
    const path = buildStoragePath("lecture-artifacts", "lecture-1", "!!!.pdf");

    expect(path).toMatch(/^lecture-1\/file-[a-z0-9]+\.pdf$/);
    expect(path).not.toBe("lecture-1/.pdf");
    expect(buildStoragePath("lecture-artifacts", "lecture-1", "!!!.pdf")).toBe(path);
  });

  it("adds a unique suffix to upload paths to avoid storage collisions", () => {
    const path = buildUniqueStoragePath("lecture-html", "lecture-1", "2교시_강의안.pdf");

    expect(path).toMatch(/^lecture-1\/2-[a-f0-9]{8}\.pdf$/);
  });

  it("overrides proxied content headers for rendered lecture HTML", async () => {
    createSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://signed.example/lecture" }, error: null });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response("<html></html>", {
          headers: { "content-type": "text/plain" }
        })
      )
    );

    const response = await createPrivateObjectResponse("lecture-html", "lecture-1/lecture.html", 30, {
      contentType: "text/html; charset=utf-8",
      contentDisposition: "inline",
      fileName: "lecture.html"
    });

    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("content-disposition")).toContain("inline");
  });

  it("forces file artifacts to download", async () => {
    createSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://signed.example/artifact" }, error: null });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response("pdf", {
          headers: { "content-type": "application/pdf" }
        })
      )
    );

    const response = await createPrivateObjectResponse("lecture-artifacts", "lecture-1/practice.pdf", 30, {
      contentDisposition: "attachment"
    });

    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(response.headers.get("content-disposition")).toContain("practice.pdf");
  });

  it("removes exactly the requested object from the requested bucket", async () => {
    remove.mockResolvedValueOnce({ data: [], error: null });

    await removeStorageObject("lecture-artifacts", "lecture-1/practice.pdf");

    expect(storageFrom).toHaveBeenCalledWith("lecture-artifacts");
    expect(remove).toHaveBeenCalledWith(["lecture-1/practice.pdf"]);
  });

  it("surfaces storage errors instead of swallowing them when removing an object", async () => {
    remove.mockResolvedValueOnce({ data: null, error: { message: "storage unavailable" } });

    await expect(removeStorageObject("lecture-artifacts", "lecture-1/practice.pdf")).rejects.toMatchObject({
      message: "storage unavailable"
    });
  });
});
