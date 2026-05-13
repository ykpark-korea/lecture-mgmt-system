import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import ArtifactPanel from "@/components/learner/ArtifactPanel";
import LectureViewer from "@/components/learner/LectureViewer";
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
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-lg border border-cool-mist bg-white/88 p-5 shadow-soft sm:p-6">
          <Link
            href="/lectures"
            className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            목록으로
          </Link>
          <p className="mt-5 text-sm font-semibold text-hanwha-orange">Hanwha Lecture</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-cool-ink sm:text-3xl">
            {lecture.title}
          </h1>
          {lecture.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{lecture.description}</p>
          ) : null}
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <LectureViewer lectureId={lecture.id} title={lecture.title} />
          <ArtifactPanel artifacts={artifacts} />
        </div>
      </div>
    </main>
  );
}
