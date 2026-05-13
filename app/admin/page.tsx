import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft lg:col-span-2">
          <p className="text-sm font-semibold text-cool-blue">Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold">운영 현황</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            활성 코드, 공개 강의, 최근 수정 항목을 확인하는 관리자 홈입니다.
          </p>
        </section>
        <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
          <h2 className="text-lg font-bold">오늘의 작업</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">강의와 접속 코드 관리 기능이 다음 단계에서 연결됩니다.</p>
        </section>
      </div>
    </AdminShell>
  );
}
