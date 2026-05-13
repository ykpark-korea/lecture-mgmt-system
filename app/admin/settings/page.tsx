import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-cool-blue">Settings</p>
        <h1 className="mt-2 text-2xl font-bold">시스템 설정</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          관리자 코드, 기본 이미지, 업로드 제한을 확인합니다.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {["세션", "스토리지", "코드 정책"].map((label) => (
            <div key={label} className="rounded-lg border border-cool-mist bg-cool-ice p-4">
              <h2 className="font-bold">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">운영 설정 확인 영역입니다.</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
