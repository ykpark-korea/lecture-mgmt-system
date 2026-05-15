import { AdminShell } from "@/components/admin/AdminShell";
import { LectureAdminWorkspace } from "@/components/admin/LectureAdminWorkspace";

export default function AdminLecturesPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <p className="text-sm font-bold text-cool-blue">Lectures</p>
          <h1 className="mt-2 text-3xl font-black">강의 관리</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            강좌 목록을 기준으로 공개 상태, 강의자료, 학습자료, 접속 코드 연결을 한곳에서 관리합니다.
          </p>
        </section>
        <LectureAdminWorkspace />
      </div>
    </AdminShell>
  );
}
