import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { AccessCode, Lecture, LectureStatus } from "@/src/types/database";

export interface AccessCodeVisibilityInput {
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

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

  if (lecture.published_starts_at && new Date(lecture.published_starts_at) > now) {
    return false;
  }

  if (lecture.published_ends_at && new Date(lecture.published_ends_at) < now) {
    return false;
  }

  return true;
}

export function isAccessCodeUsableForLearner(
  accessCode: AccessCodeVisibilityInput,
  now = new Date()
): boolean {
  if (!accessCode.is_active) {
    return false;
  }

  const startsAt = new Date(accessCode.starts_at);
  const endsAt = new Date(accessCode.ends_at);

  return startsAt <= now && endsAt >= now;
}

export async function listLecturesForAccessCode(
  accessCodeId: string,
  now = new Date()
): Promise<Lecture[]> {
  const supabase = createSupabaseServiceClient();
  const { data: accessCode, error: accessCodeError } = await supabase
    .from("access_codes")
    .select("*")
    .eq("id", accessCodeId)
    .maybeSingle();

  if (accessCodeError) {
    throw accessCodeError;
  }

  if (!accessCode || !isAccessCodeUsableForLearner(accessCode as AccessCode, now)) {
    return [];
  }

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
    .filter((lecture) => isLectureVisibleForCode(lecture, now));
}

export async function getAuthorizedLecture(
  accessCodeId: string,
  lectureId: string,
  now = new Date()
): Promise<Lecture | null> {
  const lectures = await listLecturesForAccessCode(accessCodeId, now);

  return lectures.find((lecture) => lecture.id === lectureId) ?? null;
}
