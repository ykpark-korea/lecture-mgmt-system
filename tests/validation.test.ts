import { describe, expect, it } from "vitest";
import { artifactSchema, isAllowedArtifactFile, isAllowedHtmlFile, learnerCodeSchema } from "@/src/lib/validation";

describe("validation", () => {
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
        lectureId: "11111111-1111-1111-1111-111111111111",
        type: "file",
        category: "practice",
        title: "Practice file"
      })
    ).toThrow();
  });
});
