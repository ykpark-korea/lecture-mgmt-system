import { ArtifactEditor } from "@/components/admin/ArtifactEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { LectureEditor } from "@/components/admin/LectureEditor";

export default function AdminLecturesPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <p className="text-sm font-bold text-cool-blue">Lectures</p>
          <h1 className="mt-2 text-3xl font-black">강의 관리</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            강좌 생성, HTML 업로드, 공개 상태, 아티팩트를 관리합니다.
          </p>
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          <LectureEditor />
          <ArtifactEditor />
        </div>
      </div>
    </AdminShell>
  );
}
