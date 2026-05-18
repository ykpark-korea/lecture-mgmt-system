import { z } from "zod";
import type { StorageBucket } from "@/src/lib/storage";
import { detectLectureMaterialType, lectureMaterialTypes } from "@/src/lib/materials";

export const learnerCodeSchema = z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/);
export const adminCodeSchema = learnerCodeSchema;

export const lectureStatusSchema = z.enum(["draft", "active", "inactive"]);
export const lectureMaterialTypeSchema = z.enum(lectureMaterialTypes);
export const artifactTypeSchema = z.enum(["file", "link"]);
export const artifactCategorySchema = z.enum(["practice", "reference", "external", "preparation"]);
export const httpUrlSchema = z.string().url().refine(isHttpUrl, {
  message: "URL must use http or https"
});

export const allowedHtmlExtensions = [".html", ".htm"] as const;
export const allowedLectureMaterialExtensions = [".html", ".htm", ".pdf", ".ppt", ".pptx"] as const;
export const allowedArtifactExtensions = [
  ".html",
  ".htm",
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
export const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"] as const;
export const allowedArtifactContentTypes = [
  "text/html",
  "application/pdf",
  "application/zip",
  "application/octet-stream",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp"
] as const;
export const allowedLectureMaterialContentTypes = [
  "text/html",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/octet-stream"
] as const;

function hasAllowedExtension(fileName: string, extensions: readonly string[]) {
  const lower = fileName.toLowerCase();
  return extensions.some((extension) => lower.endsWith(extension));
}

export function isAllowedHtmlFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedHtmlExtensions);
}

export function isAllowedLectureMaterialFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedLectureMaterialExtensions);
}

export function isAllowedArtifactFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedArtifactExtensions);
}

export function isAllowedImageFile(fileName: string) {
  return hasAllowedExtension(fileName, allowedImageExtensions);
}

export function isValidStoragePath(bucket: StorageBucket, path: string) {
  const parts = path.split("/");

  if (
    path.startsWith("/") ||
    path.includes("\\") ||
    path.includes("..") ||
    parts.length !== 2 ||
    parts.some((part) => part.length === 0)
  ) {
    return false;
  }

  const [owner, fileName] = parts;

  if (!/^[A-Za-z0-9_-]+$/.test(owner) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(fileName)) {
    return false;
  }

  if (bucket === "lecture-html") {
    return isAllowedLectureMaterialFile(fileName);
  }

  if (bucket === "lecture-images") {
    return isAllowedImageFile(fileName);
  }

  return isAllowedArtifactFile(fileName);
}

export function isAllowedUploadContentType(bucket: StorageBucket, fileName: string, contentType: string) {
  return Boolean(normalizeUploadContentType(bucket, fileName, contentType));
}

export function normalizeUploadContentType(bucket: StorageBucket, fileName: string, contentType: string) {
  const normalizedContentType = contentType.trim().toLowerCase();
  const lower = fileName.toLowerCase();

  if (bucket === "lecture-html") {
    if (!isAllowedLectureMaterialFile(fileName)) return null;

    if (allowedLectureMaterialContentTypes.includes(normalizedContentType as never)) {
      return getLectureMaterialContentTypeFromFileName(lower);
    }

    return getLectureMaterialContentTypeFromFileName(lower);
  }

  if (bucket === "lecture-images") {
    if (!isAllowedImageContentType(fileName, normalizedContentType)) return null;

    return normalizedContentType;
  }

  if (!isAllowedArtifactFile(fileName)) return null;

  if (allowedArtifactContentTypes.includes(normalizedContentType as never)) {
    return getArtifactContentTypeFromFileName(lower);
  }

  return getArtifactContentTypeFromFileName(lower);
}

function getLectureMaterialContentTypeFromFileName(fileName: string) {
  if (fileName.endsWith(".html") || fileName.endsWith(".htm")) return "text/html";
  if (fileName.endsWith(".pdf") || fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) return "application/octet-stream";

  return null;
}

function getArtifactContentTypeFromFileName(fileName: string) {
  if (fileName.endsWith(".html") || fileName.endsWith(".htm")) return "text/html";
  if (fileName.endsWith(".pdf")) return "application/octet-stream";
  if (fileName.endsWith(".zip")) return "application/zip";
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".pptx") || fileName.endsWith(".docx")) return "application/octet-stream";
  if (fileName.endsWith(".csv")) return "text/csv";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
  if (fileName.endsWith(".webp")) return "image/webp";

  return null;
}

function isAllowedImageContentType(fileName: string, contentType: string) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".png")) {
    return contentType === "image/png";
  }

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return contentType === "image/jpeg";
  }

  if (lower.endsWith(".webp")) {
    return contentType === "image/webp";
  }

  return false;
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

function hasAtLeastOneDefinedValue(value: Record<string, unknown>) {
  return Object.values(value).some((field) => field !== undefined);
}

function isEndAfterStart(startsAt: string, endsAt: string) {
  return new Date(endsAt).getTime() > new Date(startsAt).getTime();
}

const htmlStoragePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((path) => isValidStoragePath("lecture-html", path) && isAllowedHtmlFile(path.split("/")[1] ?? ""), {
    message: "htmlStoragePath must be a safe lecture-html path ending in .html or .htm"
  });

const lectureMaterialStoragePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((path) => isValidStoragePath("lecture-html", path), {
    message: "materialStoragePath must be a safe lecture-html path ending in .html, .htm, .pdf, .ppt, or .pptx"
  });

const displayPdfStoragePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((path) => isValidStoragePath("lecture-html", path) && path.toLowerCase().endsWith(".pdf"), {
    message: "displayPdfStoragePath must be a safe lecture-html path ending in .pdf"
  });

const thumbnailStoragePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((path) => isValidStoragePath("lecture-images", path), {
    message: "thumbnailStoragePath must be a safe lecture-images path"
  });

export const createLectureSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(""),
  status: lectureStatusSchema.default("draft"),
  materialType: lectureMaterialTypeSchema.default("html"),
  materialStoragePath: lectureMaterialStoragePathSchema.optional(),
  displayPdfStoragePath: displayPdfStoragePathSchema.optional(),
  htmlStoragePath: htmlStoragePathSchema.optional(),
  thumbnailStoragePath: thumbnailStoragePathSchema.optional(),
  usesDefaultHero: z.boolean().default(true),
  publishedStartsAt: z.string().datetime().optional(),
  publishedEndsAt: z.string().datetime().optional(),
  sortOrder: z.number().int().min(0).default(0)
}).superRefine((value, context) => {
  validateLectureMaterialFields(value, context);
}).refine(
  (value) =>
    !value.publishedStartsAt ||
    !value.publishedEndsAt ||
    isEndAfterStart(value.publishedStartsAt, value.publishedEndsAt),
  {
    path: ["publishedEndsAt"],
    message: "publishedEndsAt must be after publishedStartsAt"
  }
);

export const updateLectureSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(1000).optional(),
    status: lectureStatusSchema.optional(),
    materialType: lectureMaterialTypeSchema.optional(),
    materialStoragePath: lectureMaterialStoragePathSchema.optional(),
    displayPdfStoragePath: displayPdfStoragePathSchema.optional(),
    htmlStoragePath: htmlStoragePathSchema.optional(),
    thumbnailStoragePath: thumbnailStoragePathSchema.optional(),
    usesDefaultHero: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    publishedStartsAt: z.string().datetime().optional(),
    publishedEndsAt: z.string().datetime().optional()
  })
  .refine(hasAtLeastOneDefinedValue, {
    message: "At least one lecture field is required"
  })
  .superRefine((value, context) => {
    validateLectureMaterialFields(value, context);
  })
  .refine(
    (value) =>
      !value.publishedStartsAt ||
      !value.publishedEndsAt ||
      isEndAfterStart(value.publishedStartsAt, value.publishedEndsAt),
    {
      path: ["publishedEndsAt"],
      message: "publishedEndsAt must be after publishedStartsAt"
    }
  );

function validateLectureMaterialFields(
  value: { materialType?: string; materialStoragePath?: string; htmlStoragePath?: string; displayPdfStoragePath?: string },
  context: z.RefinementCtx
) {
  if (value.materialStoragePath && value.materialType) {
    const detectedType = detectLectureMaterialType(value.materialStoragePath);

    if (detectedType !== value.materialType) {
      context.addIssue({
        code: "custom",
        path: ["materialStoragePath"],
        message: "materialStoragePath extension must match materialType"
      });
    }
  }

  if (value.htmlStoragePath && value.materialType && value.materialType !== "html") {
    context.addIssue({
      code: "custom",
      path: ["htmlStoragePath"],
      message: "htmlStoragePath can only be used with HTML materials"
    });
  }
}

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

export const updateAccessCodeSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(500).optional()
  })
  .refine(hasAtLeastOneDefinedValue, {
    message: "At least one access code field is required"
  })
  .refine((value) => !value.startsAt || !value.endsAt || isEndAfterStart(value.startsAt, value.endsAt), {
    path: ["endsAt"],
    message: "endsAt must be after startsAt"
  });

export const linkLectureAccessCodeSchema = z.object({
  lectureId: z.string().uuid(),
  accessCodeId: z.string().uuid(),
  sortOrder: z.number().int().min(0).default(0)
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
      } else if (!isValidStoragePath("lecture-artifacts", value.storagePath)) {
        context.addIssue({
          code: "custom",
          path: ["storagePath"],
          message: "file artifact requires a safe lecture-artifacts storagePath"
        });
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
