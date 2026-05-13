import Link from "next/link";
import { ArrowLeft, Layers3 } from "lucide-react";
import { redirect } from "next/navigation";
import LectureWorkspace from "@/components/learner/LectureWorkspace";
import { listActiveArtifactsForLecture } from "@/src/lib/artifacts";
import { readLearnerSession } from "@/src/lib/cookies";
import { getAuthorizedLecture } from "@/src/lib/lectures";

type LecturePageProps = {
  params: Promise<{ lectureId: string }>;
};

export default async function LecturePage({ params }: LecturePageProps) {
  const session = await readLearnerSession();

  if (!session) {
    redirect("/");
  }

  const { lectureId } = await params;
  const lecture = await getAuthorizedLecture(session.accessCodeId, lectureId);

  if (!lecture) {
    redirect("/lectures");
  }

  const artifacts = await listActiveArtifactsForLecture(lectureId);

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-4">
        <header className="overflow-hidden rounded-lg border border-white/80 bg-white/86 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <div className="h-2 bg-gradient-to-r from-cool-mint via-cool-aqua to-cool-blue" />
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/lectures"
                  className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                  목록으로
                </Link>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-hanwha-orange">
                  <Layers3 aria-hidden="true" size={16} />
                  Hanwha Lecture Workspace
                </p>
              </div>
              <h1 className="mt-3 break-words text-2xl font-black tracking-normal text-cool-ink sm:text-3xl">
                {lecture.title}
              </h1>
              {lecture.description ? (
                <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-600">{lecture.description}</p>
              ) : null}
            </div>
          </div>
        </header>

        <LectureWorkspace lectureId={lecture.id} title={lecture.title} artifacts={artifacts} />
      </div>
    </main>
  );
}
