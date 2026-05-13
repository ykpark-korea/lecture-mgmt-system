import { z } from "zod";

export const learnerCodeSchema = z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/);
export const adminCodeSchema = learnerCodeSchema;

export const lectureStatusSchema = z.enum(["draft", "active", "inactive"]);
export const artifactTypeSchema = z.enum(["file", "link"]);
export const artifactCategorySchema = z.enum(["practice", "reference", "external", "preparation"]);
export const httpUrlSchema = z.string().url().refine(isHttpUrl, {
  message: "URL must use http or https"
});

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
export const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"] as const;

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

export function isAllowedImageFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedImageExtensions);
}

export function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const createLectureSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(""),
  status: lectureStatusSchema.default("draft"),
  htmlStoragePath: z.string().trim().min(1).optional(),
  thumbnailStoragePath: z.string().trim().min(1).optional(),
  usesDefaultHero: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
});

export const createAccessCodeSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    code: learnerCodeSchema,
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    isActive: z.boolean().default(true),
    notes: z.string().trim().max(500).optional()
  })
  .refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
    path: ["endsAt"],
    message: "endsAt must be after startsAt"
  });

export const artifactSchema = z
  .object({
    lectureId: z.string().uuid(),
    type: artifactTypeSchema,
    category: artifactCategorySchema,
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    url: httpUrlSchema.optional(),
    storagePath: z.string().trim().min(1).optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0)
  })
  .superRefine((value, context) => {
    if (value.type === "file") {
      if (!value.storagePath) {
        context.addIssue({ code: "custom", path: ["storagePath"], message: "file artifact requires storagePath" });
      }

      if (value.url) {
        context.addIssue({ code: "custom", path: ["url"], message: "file artifact must not include url" });
      }
    }

    if (value.type === "link") {
      if (!value.url) {
        context.addIssue({ code: "custom", path: ["url"], message: "link artifact requires url" });
      }

      if (value.storagePath) {
        context.addIssue({ code: "custom", path: ["storagePath"], message: "link artifact must not include storagePath" });
      }
    }
  });
