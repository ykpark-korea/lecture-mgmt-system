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
});
