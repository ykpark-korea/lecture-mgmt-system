import Link from "next/link";
import { ArrowRight, BookOpen, FileText, PlayCircle } from "lucide-react";
import type { Lecture } from "@/src/types/database";

type LectureCardProps = {
  lecture: Lecture;
};

export default function LectureCard({ lecture }: LectureCardProps) {
  return (
    <article className="group flex min-h-72 flex-col overflow-hidden rounded-lg border border-white/80 bg-white/88 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cool-blue/35 hover:bg-white">
      <div className="h-2 bg-gradient-to-r from-cool-mint via-cool-aqua to-cool-blue" />
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cool-sky text-cool-blue ring-1 ring-white">
          <BookOpen aria-hidden="true" size={22} />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-cool-mist bg-cool-ice px-3 py-1 text-xs font-bold text-cool-navy">
          <PlayCircle aria-hidden="true" size={13} />
          Ready
        </span>
      </div>
      <div className="mt-5 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cool-blue">
          Hanwha Class
        </p>
        <h2 className="mt-3 break-words text-2xl font-black tracking-normal text-cool-ink transition group-hover:text-cool-blue">
          {lecture.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {lecture.description || "강의실에서 학습 콘텐츠와 관련 자료를 확인하세요."}
        </p>
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <FileText aria-hidden="true" size={15} className="text-cool-blue" />
        강의 화면과 자료실 동시 제공
      </div>
      <Link
        href={`/lecture/${lecture.id}`}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-cool-navy px-4 py-3 text-sm font-bold text-white shadow-float transition hover:bg-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
      >
        강의 보기
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
      </div>
    </article>
  );
}
