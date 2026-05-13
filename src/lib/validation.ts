import { z } from "zod";

export const learnerCodeSchema = z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/);
export const adminCodeSchema = learnerCodeSchema;

export const lectureStatusSchema = z.enum(["draft", "active", "inactive"]);
export const artifactTypeSchema = z.enum(["file", "link"]);
export const artifactCategorySchema = z.enum(["practice", "reference", "external", "preparation"]);

export const allowedHtmlExtensions = [".html"] as const;
export const allowedArtifactExtensions = [
  ".pdf",
  ".zip",
  ".xlsx",
  ".pptx",
  ".docx",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp"
] as const;

function hasAllowedExtension(fileName: string, extensions: readonly string[]) {
  const lower = fileName.toLowerCase();
  return extensions.some((extension) => lower.endsWith(extension));
}

export function isAllowedHtmlFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedHtmlExtensions);
}

export function isAllowedArtifactFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedArtifactExtensions);
}

export const artifactSchema = z
  .object({
    lectureId: z.string().uuid(),
    type: artifactTypeSchema,
    category: artifactCategorySchema,
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    url: z.string().url().optional(),
    storagePath: z.string().trim().min(1).optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0)
  })
  .superRefine((value, context) => {
    if (value.type === "file" && !value.storagePath) {
      context.addIssue({ code: "custom", path: ["storagePath"], message: "file artifact requires storagePath" });
    }

    if (value.type === "link" && !value.url) {
      context.addIssue({ code: "custom", path: ["url"], message: "link artifact requires url" });
    }
  });
