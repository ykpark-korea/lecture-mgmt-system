import { describe, expect, it, vi } from "vitest";
import { isLectureVisibleForCode, type LectureVisibilityInput } from "@/src/lib/lectures";

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn()
}));

describe("lectures", () => {
  const now = new Date("2026-05-13T12:00:00.000Z");

  function lecture(overrides: Partial<LectureVisibilityInput> = {}): LectureVisibilityInput {
    return {
      status: "active",
      published_starts_at: "2026-05-13T00:00:00.000Z",
      published_ends_at: "2026-05-14T00:00:00.000Z",
      ...overrides
    };
  }

  it("allows active lectures inside the publish window", () => {
    expect(isLectureVisibleForCode(lecture(), now)).toBe(true);
  });

  it("blocks inactive lectures", () => {
    expect(isLectureVisibleForCode(lecture({ status: "inactive" }), now)).toBe(false);
  });

  it("blocks lectures after the end date", () => {
    expect(
      isLectureVisibleForCode(
        lecture({
          published_ends_at: "2026-05-13T11:59:59.000Z"
        }),
        now
      )
    ).toBe(false);
  });
});
