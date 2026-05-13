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

export interface AdminCode {
  id: string;
  name: string;
  code_hash: string;
  expires_at: string;
  is_active: boolean;
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

export interface LectureAccessCode {
  id: string;
  lecture_id: string;
  access_code_id: string;
  sort_order: number;
  created_at: string;
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

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

type AccessCodeInsert = Omit<AccessCode, "id" | "notes" | "is_active" | "created_at" | "updated_at"> & {
  id?: string;
  is_active?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AccessCodeUpdate = Partial<AccessCodeInsert>;

type AdminCodeInsert = Omit<AdminCode, "id" | "is_active" | "created_at" | "updated_at"> & {
  id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type AdminCodeUpdate = Partial<AdminCodeInsert>;

type LectureInsert = Omit<
  Lecture,
  | "id"
  | "description"
  | "status"
  | "html_storage_path"
  | "thumbnail_storage_path"
  | "uses_default_hero"
  | "published_starts_at"
  | "published_ends_at"
  | "sort_order"
  | "created_at"
  | "updated_at"
> & {
  id?: string;
  description?: string;
  status?: LectureStatus;
  html_storage_path?: string | null;
  thumbnail_storage_path?: string | null;
  uses_default_hero?: boolean;
  published_starts_at?: string | null;
  published_ends_at?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type LectureUpdate = Partial<LectureInsert>;

type LectureAccessCodeInsert = Omit<LectureAccessCode, "id" | "sort_order" | "created_at"> & {
  id?: string;
  sort_order?: number;
  created_at?: string;
};

type LectureAccessCodeUpdate = Partial<LectureAccessCodeInsert>;

type ArtifactInsert = Omit<
  Artifact,
  "id" | "description" | "url" | "storage_path" | "is_active" | "sort_order" | "created_at" | "updated_at"
> & {
  id?: string;
  description?: string;
  url?: string | null;
  storage_path?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type ArtifactUpdate = Partial<ArtifactInsert>;

export interface Database {
  public: {
    Tables: {
      access_codes: TableDefinition<AccessCode, AccessCodeInsert, AccessCodeUpdate>;
      admin_codes: TableDefinition<AdminCode, AdminCodeInsert, AdminCodeUpdate>;
      lectures: TableDefinition<Lecture, LectureInsert, LectureUpdate>;
      lecture_access_codes: TableDefinition<
        LectureAccessCode,
        LectureAccessCodeInsert,
        LectureAccessCodeUpdate
      >;
      artifacts: TableDefinition<Artifact, ArtifactInsert, ArtifactUpdate>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
