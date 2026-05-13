import { AdminShell } from "@/components/admin/AdminShell";
import { CodeManager } from "@/components/admin/CodeManager";

export default function AdminCodesPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-cool-blue">Codes</p>
          <h1 className="mt-2 text-2xl font-bold">접속 코드 관리</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">기간제 수강 코드를 만들고 연결 강의를 운영합니다.</p>
        </section>
        <CodeManager />
      </div>
    </AdminShell>
  );
}
