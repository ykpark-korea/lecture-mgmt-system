export type LectureStatus = "draft" | "active" | "inactive";
export type ArtifactType = "file" | "link";
export type ArtifactCategory = "practice" | "reference" | "external" | "preparation";

export interface AccessCode {
  id: string;
  name: string;
  code_hash: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  status: LectureStatus;
  html_storage_path: string | null;
  thumbnail_storage_path: string | null;
  uses_default_hero: boolean;
  published_starts_at: string | null;
  published_ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  lecture_id: string;
  type: ArtifactType;
  category: ArtifactCategory;
  title: string;
  description: string;
  url: string | null;
  storage_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
