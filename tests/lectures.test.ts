import { describe, expect, it, vi } from "vitest";
import {
  isAccessCodeUsableForLearner,
  isLectureVisibleForCode,
  type AccessCodeVisibilityInput,
  type LectureVisibilityInput
} from "@/src/lib/lectures";

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

  function accessCode(overrides: Partial<AccessCodeVisibilityInput> = {}): AccessCodeVisibilityInput {
    return {
      is_active: true,
      starts_at: "2026-05-13T00:00:00.000Z",
      ends_at: "2026-05-14T00:00:00.000Z",
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

  it("allows active access codes inside the access window", () => {
    expect(isAccessCodeUsableForLearner(accessCode(), now)).toBe(true);
  });

  it("blocks inactive access codes", () => {
    expect(isAccessCodeUsableForLearner(accessCode({ is_active: false }), now)).toBe(false);
  });

  it("blocks access codes after the end date", () => {
    expect(
      isAccessCodeUsableForLearner(
        accessCode({
          ends_at: "2026-05-13T11:59:59.000Z"
        }),
        now
      )
    ).toBe(false);
  });
});
