import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { Lecture, LectureStatus } from "@/src/types/database";

export interface LectureVisibilityInput {
  status: LectureStatus;
  published_starts_at: string | null;
  published_ends_at: string | null;
}

type LectureAccessCodeRow = {
  sort_order: number;
  lectures: Lecture | null;
};

export function isLectureVisibleForCode(
  lecture: LectureVisibilityInput,
  now = new Date()
): boolean {
  if (lecture.status !== "active") {
    return false;
  }

  if (!lecture.published_starts_at || !lecture.published_ends_at) {
    return false;
  }

  const startsAt = new Date(lecture.published_starts_at);
  const endsAt = new Date(lecture.published_ends_at);

  return startsAt <= now && endsAt >= now;
}

export async function listLecturesForAccessCode(accessCodeId: string): Promise<Lecture[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("lecture_access_codes")
    .select("sort_order, lectures(*)")
    .eq("access_code_id", accessCodeId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as LectureAccessCodeRow[])
    .map((row) => row.lectures)
    .filter((lecture): lecture is Lecture => Boolean(lecture))
    .filter((lecture) => isLectureVisibleForCode(lecture));
}

export async function getAuthorizedLecture(
  accessCodeId: string,
  lectureId: string
): Promise<Lecture | null> {
  const lectures = await listLecturesForAccessCode(accessCodeId);

  return lectures.find((lecture) => lecture.id === lectureId) ?? null;
}
