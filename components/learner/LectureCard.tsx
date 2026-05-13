import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Lecture } from "@/src/types/database";

type LectureCardProps = {
  lecture: Lecture;
};

export default function LectureCard({ lecture }: LectureCardProps) {
  return (
    <article className="flex min-h-64 flex-col rounded-lg border border-cool-mist bg-white/90 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-cool-blue/40 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cool-mist text-cool-blue">
        <BookOpen aria-hidden="true" size={22} />
      </div>
      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-normal text-hanwha-orange">
          Hanwha Class
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-normal text-cool-ink">{lecture.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {lecture.description || "강의실에서 학습 콘텐츠와 관련 자료를 확인하세요."}
        </p>
      </div>
      <Link
        href={`/lecture/${lecture.id}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-cool-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
      >
        강의 보기
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </article>
  );
}
