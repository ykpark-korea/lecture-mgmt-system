import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  const settings = [
    { label: "세션", value: "관리자/수강자 코드 기반 세션", detail: "SESSION_SECRET으로 서명합니다." },
    { label: "스토리지", value: "Supabase private bucket", detail: "HTML, 아티팩트, 이미지 파일은 signed URL로 접근합니다." },
    { label: "코드 정책", value: "기간제 코드", detail: "시작/종료 일시와 활성 상태로 접근을 제어합니다." }
  ];

  return (
    <AdminShell>
      <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-cool-blue">Settings</p>
        <h1 className="mt-2 text-2xl font-bold">시스템 설정</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          관리자 코드, 기본 이미지, 업로드 제한을 확인합니다.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {settings.map((item) => (
            <div key={item.label} className="rounded-lg border border-cool-mist bg-cool-ice p-4">
              <h2 className="font-bold">{item.label}</h2>
              <p className="mt-2 text-sm font-semibold text-cool-ink">{item.value}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
