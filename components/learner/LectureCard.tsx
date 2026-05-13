import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Lecture } from "@/src/types/database";

type LectureCardProps = {
  lecture: Lecture;
};

export default function LectureCard({ lecture }: LectureCardProps) {
  return (
    <article className="group flex min-h-64 flex-col rounded-lg border border-white/80 bg-white/92 p-6 shadow-soft ring-1 ring-cool-mist/70 transition hover:-translate-y-0.5 hover:border-cool-blue/35 hover:bg-white hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cool-mist text-cool-blue ring-1 ring-white">
          <BookOpen aria-hidden="true" size={22} />
        </div>
        <span className="h-2 w-2 rounded-full bg-hanwha-orange shadow-[0_0_0_5px_rgba(243,115,33,0.12)]" />
      </div>
      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-normal text-cool-blue">
          Hanwha Class
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-normal text-cool-ink transition group-hover:text-cool-blue">
          {lecture.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {lecture.description || "강의실에서 학습 콘텐츠와 관련 자료를 확인하세요."}
        </p>
      </div>
      <Link
        href={`/lecture/${lecture.id}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-cool-blue/20 bg-cool-ice px-4 py-3 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:bg-cool-blue hover:text-white focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
      >
        강의 보기
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </article>
  );
}
