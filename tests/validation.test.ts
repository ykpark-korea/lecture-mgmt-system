import { describe, expect, it } from "vitest";
import {
  artifactSchema,
  createAccessCodeSchema,
  createLectureSchema,
  isAllowedArtifactFile,
  isAllowedHtmlFile,
  isAllowedImageFile,
  isAllowedUploadContentType,
  isValidStoragePath,
  linkLectureAccessCodeSchema,
  learnerCodeSchema,
  updateAccessCodeSchema,
  updateLectureSchema
} from "@/src/lib/validation";

describe("validation", () => {
  const lectureId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts learner codes with useful characters", () => {
    expect(learnerCodeSchema.parse("HPMP-2026")).toBe("HPMP-2026");
  });

  it("rejects empty learner codes", () => {
    expect(() => learnerCodeSchema.parse("")).toThrow();
  });

  it("allows only html lecture uploads", () => {
    expect(isAllowedHtmlFile("lecture.html")).toBe(true);
    expect(isAllowedHtmlFile("lecture.pdf")).toBe(false);
  });

  it("allows artifact file extensions from the MVP allowlist", () => {
    expect(isAllowedArtifactFile("practice.zip")).toBe(true);
    expect(isAllowedArtifactFile("guide.pdf")).toBe(true);
    expect(isAllowedArtifactFile("script.exe")).toBe(false);
  });

  it("allows image uploads only for common web image extensions", () => {
    expect(isAllowedImageFile("hero.webp")).toBe(true);
    expect(isAllowedImageFile("hero.pdf")).toBe(false);
    expect(isAllowedImageFile("hero.gif")).toBe(false);
  });

  it("defaults optional lecture creation fields", () => {
    expect(createLectureSchema.parse({ title: "  MVP 강의  " })).toMatchObject({
      title: "MVP 강의",
      description: "",
      status: "draft",
      usesDefaultHero: true,
      sortOrder: 0
    });
  });

  it("validates bucket-specific persisted storage paths", () => {
    expect(isValidStoragePath("lecture-html", `${lectureId}/lecture.html`)).toBe(true);
    expect(isValidStoragePath("lecture-html", `/lecture.html`)).toBe(false);
    expect(isValidStoragePath("lecture-html", `${lectureId}/nested/lecture.html`)).toBe(false);
    expect(isValidStoragePath("lecture-html", `${lectureId}/lecture.pdf`)).toBe(false);
    expect(isValidStoragePath("lecture-images", `${lectureId}/hero.webp`)).toBe(true);
    expect(isValidStoragePath("lecture-artifacts", `${lectureId}/practice.zip`)).toBe(true);
    expect(isValidStoragePath("lecture-artifacts", `${lectureId}/../practice.zip`)).toBe(false);
  });

  it("rejects unsafe lecture storage paths", () => {
    expect(() =>
      createLectureSchema.parse({
        title: "Lecture",
        htmlStoragePath: `${lectureId}/lecture.pdf`
      })
    ).toThrow();

    expect(() =>
      createLectureSchema.parse({
        title: "Lecture",
        thumbnailStoragePath: `${lectureId}/thumbnail.pdf`
      })
    ).toThrow();
  });

  it("accepts lecture publish windows only when the end is after the start", () => {
    expect(
      createLectureSchema.parse({
        title: "Lecture",
        publishedStartsAt: "2026-05-13T09:00:00.000Z",
        publishedEndsAt: "2026-05-13T10:00:00.000Z"
      })
    ).toMatchObject({
      publishedStartsAt: "2026-05-13T09:00:00.000Z",
      publishedEndsAt: "2026-05-13T10:00:00.000Z"
    });

    expect(() =>
      createLectureSchema.parse({
        title: "Lecture",
        publishedStartsAt: "2026-05-13T09:00:00.000Z",
        publishedEndsAt: "2026-05-13T09:00:00.000Z"
      })
    ).toThrow();
  });

  it("requires at least one lecture update field and validates paths and publish windows", () => {
    expect(() => updateLectureSchema.parse({})).toThrow();
    expect(() => updateLectureSchema.parse({ htmlStoragePath: `${lectureId}/lecture.pdf` })).toThrow();
    expect(() =>
      updateLectureSchema.parse({
        publishedStartsAt: "2026-05-13T10:00:00.000Z",
        publishedEndsAt: "2026-05-13T09:00:00.000Z"
      })
    ).toThrow();

    expect(updateLectureSchema.parse({ status: "active", sortOrder: 2 })).toMatchObject({
      status: "active",
      sortOrder: 2
    });
  });

  it("requires at least one access code update field and validates date ranges", () => {
    expect(() => updateAccessCodeSchema.parse({})).toThrow();
    expect(() =>
      updateAccessCodeSchema.parse({
        startsAt: "2026-05-13T10:00:00.000Z",
        endsAt: "2026-05-13T09:00:00.000Z"
      })
    ).toThrow();

    expect(updateAccessCodeSchema.parse({ isActive: false })).toEqual({ isActive: false });
  });

  it("defaults lecture access code link sort order", () => {
    expect(
      linkLectureAccessCodeSchema.parse({
        lectureId,
        accessCodeId: "550e8400-e29b-41d4-a716-446655440001"
      })
    ).toEqual({
      lectureId,
      accessCodeId: "550e8400-e29b-41d4-a716-446655440001",
      sortOrder: 0
    });
  });

  it("validates upload content type by bucket and extension", () => {
    expect(isAllowedUploadContentType("lecture-html", "lecture.html", "text/html")).toBe(true);
    expect(isAllowedUploadContentType("lecture-html", "lecture.html", "application/pdf")).toBe(false);
    expect(isAllowedUploadContentType("lecture-images", "hero.webp", "image/webp")).toBe(true);
    expect(isAllowedUploadContentType("lecture-images", "hero.png", "image/png")).toBe(true);
    expect(isAllowedUploadContentType("lecture-images", "hero.jpg", "image/jpeg")).toBe(true);
    expect(isAllowedUploadContentType("lecture-images", "hero.png", "image/svg+xml")).toBe(false);
    expect(isAllowedUploadContentType("lecture-images", "hero.png", "image/jpeg")).toBe(false);
    expect(isAllowedUploadContentType("lecture-images", "hero.pdf", "image/png")).toBe(false);
    expect(isAllowedUploadContentType("lecture-artifacts", "practice.zip", "application/octet-stream")).toBe(true);
    expect(isAllowedUploadContentType("lecture-artifacts", "script.exe", "application/octet-stream")).toBe(false);
  });

  it("requires access code end time after start time", () => {
    expect(() =>
      createAccessCodeSchema.parse({
        name: "May cohort",
        code: "HANWHA-2026",
        startsAt: "2026-05-13T09:00:00.000Z",
        endsAt: "2026-05-13T09:00:00.000Z"
      })
    ).toThrow();
  });

  it("requires storage path for file artifacts", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId,
        type: "file",
        category: "practice",
        title: "Practice file"
      })
    ).toThrow();
  });

  it("rejects unsafe file artifact storage paths", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId,
        type: "file",
        category: "practice",
        title: "Practice file",
        storagePath: `${lectureId}/script.exe`
      })
    ).toThrow();
  });

  it("rejects file artifacts with a url", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId,
        type: "file",
        category: "practice",
        title: "Practice file",
        storagePath: "lectures/practice.zip",
        url: "https://example.com/practice.zip"
      })
    ).toThrow();
  });

  it("rejects link artifacts with a storage path", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId,
        type: "link",
        category: "external",
        title: "External link",
        storagePath: "lectures/external.pdf",
        url: "https://example.com/reference"
      })
    ).toThrow();
  });

  it("rejects link artifacts with non-http urls", () => {
    expect(() =>
      artifactSchema.parse({
        lectureId,
        type: "link",
        category: "external",
        title: "Unsafe link",
        url: "javascript:alert(1)"
      })
    ).toThrow();
  });

  it("accepts link artifacts with https urls", () => {
    expect(
      artifactSchema.parse({
        lectureId,
        type: "link",
        category: "external",
        title: "Reference",
        url: "https://example.com/reference"
      }).url
    ).toBe("https://example.com/reference");
  });
});
