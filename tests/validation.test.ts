import { describe, expect, it } from "vitest";
import { artifactSchema, isAllowedArtifactFile, isAllowedHtmlFile, learnerCodeSchema } from "@/src/lib/validation";

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
});
