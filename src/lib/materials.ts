export const lectureMaterialTypes = ["html", "pdf", "ppt", "pptx"] as const;

export type LectureMaterialType = (typeof lectureMaterialTypes)[number];

export function detectLectureMaterialType(fileName: string): LectureMaterialType | null {
  const lower = fileName.trim().toLowerCase();

  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return "html";
  }

  if (lower.endsWith(".pdf")) {
    return "pdf";
  }

  if (lower.endsWith(".ppt")) {
    return "ppt";
  }

  if (lower.endsWith(".pptx")) {
    return "pptx";
  }

  return null;
}

export function getLectureMaterialContentType(type: LectureMaterialType) {
  switch (type) {
    case "html":
      return "text/html; charset=utf-8";
    case "pdf":
      return "application/pdf";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
}

export function getLectureMaterialTypeLabel(type: LectureMaterialType) {
  switch (type) {
    case "html":
      return "HTML";
    case "pdf":
      return "PDF";
    case "ppt":
      return "PPT";
    case "pptx":
      return "PPTX";
  }
}
