import Link from "next/link";
import { ArrowLeft, Layers3 } from "lucide-react";
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
        <header className="overflow-hidden rounded-lg border border-white/80 bg-white/86 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <div className="h-2 bg-gradient-to-r from-cool-mint via-cool-aqua to-cool-blue" />
          <div className="p-5 sm:p-6 lg:p-7">
          <Link
            href="/lectures"
            className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            목록으로
          </Link>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hanwha-orange">
            <Layers3 aria-hidden="true" size={16} />
            Hanwha Lecture Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-cool-ink sm:text-4xl">
            {lecture.title}
          </h1>
          {lecture.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{lecture.description}</p>
          ) : null}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <LectureViewer lectureId={lecture.id} title={lecture.title} />
          <ArtifactPanel artifacts={artifacts} />
        </div>
      </div>
    </main>
  );
}
