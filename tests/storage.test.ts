import { describe, expect, it, vi } from "vitest";
import { buildStoragePath } from "@/src/lib/storage";

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn()
}));

describe("storage", () => {
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
});
