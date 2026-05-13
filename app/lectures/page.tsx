import Link from "next/link";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import HeroBanner from "@/components/learner/HeroBanner";
import LectureCard from "@/components/learner/LectureCard";
import { readLearnerSession } from "@/src/lib/cookies";
import { listLecturesForAccessCode } from "@/src/lib/lectures";

export default async function LecturesPage() {
  const session = await readLearnerSession();

  if (!session) {
    redirect("/");
  }

  const lectures = await listLecturesForAccessCode(session.accessCodeId);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <HeroBanner
          actions={
            <form action="/api/learner/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-white px-4 py-2.5 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
              >
                <LogOut aria-hidden="true" size={16} />
                로그아웃
              </button>
            </form>
          }
        />

        {lectures.length === 0 ? (
          <section className="rounded-lg border border-dashed border-cool-mist bg-white/84 p-8 text-center shadow-soft">
            <h2 className="text-xl font-bold text-cool-ink">현재 열람 가능한 강의가 없습니다</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              안내받은 수강 기간 또는 강의 공개 일정을 다시 확인해 주세요.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-hanwha-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
            >
              코드 다시 입력하기
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
