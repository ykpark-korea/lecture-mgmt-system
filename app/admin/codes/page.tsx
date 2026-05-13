import { AdminShell } from "@/components/admin/AdminShell";
import { CodeManager } from "@/components/admin/CodeManager";

export default function AdminCodesPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <p className="text-sm font-bold text-cool-blue">Codes</p>
          <h1 className="mt-2 text-3xl font-black">접속 코드 관리</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">기간제 수강 코드를 만들고 연결 강의를 운영합니다.</p>
        </section>
        <CodeManager />
      </div>
    </AdminShell>
  );
}
