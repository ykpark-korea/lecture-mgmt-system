import { Activity, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServiceClient } from "@/src/lib/supabase";
import type { LoginAuditLog, LoginAuditResult } from "@/src/types/database";

export const dynamic = "force-dynamic";

const resultLabels: Record<LoginAuditResult, string> = {
  success: "성공",
  invalid_format: "형식 오류",
  not_found: "코드 없음",
  not_started: "시작 전",
  expired: "만료",
  inactive: "비활성",
  db_error: "DB 오류"
};

const resultStyles: Record<LoginAuditResult, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  invalid_format: "border-amber-200 bg-amber-50 text-amber-700",
  not_found: "border-rose-200 bg-rose-50 text-rose-700",
  not_started: "border-sky-200 bg-sky-50 text-sky-700",
  expired: "border-slate-200 bg-slate-50 text-slate-700",
  inactive: "border-orange-200 bg-orange-50 text-orange-700",
  db_error: "border-red-200 bg-red-50 text-red-700"
};

export default async function AdminAuditPage() {
  const supabase = createSupabaseServiceClient();
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [{ data: logs }, { data: todayLogs }] = await Promise.all([
    supabase
      .from("login_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("login_audit_logs")
      .select("result")
      .gte("created_at", since.toISOString())
  ]);

  const rows = (logs ?? []) as LoginAuditLog[];
  const today = (todayLogs ?? []) as Pick<LoginAuditLog, "result">[];
  const successCount = today.filter((item) => item.result === "success").length;
  const failureCount = today.length - successCount;
  const normalizedCount = rows.filter((item) => item.changed_by_normalization).length;

  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <p className="text-sm font-bold text-cool-blue">Audit</p>
          <h1 className="mt-2 text-3xl font-black">접속 로그</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            수강자 코드 로그인 성공/실패 원인을 원문 코드 없이 확인합니다.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard icon={CheckCircle2} label="오늘 성공" value={successCount} />
            <MetricCard icon={AlertTriangle} label="오늘 실패" value={failureCount} />
            <MetricCard icon={RotateCcw} label="최근 정규화 입력" value={normalizedCount} />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-white/80 bg-white/86 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-cool-mist px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-cool-ink">최근 100건</h2>
              <p className="mt-1 text-sm text-slate-500">IP와 코드는 해시/마스킹 형태로만 저장됩니다.</p>
            </div>
            <Activity className="text-cool-blue" size={22} aria-hidden="true" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cool-mist text-sm">
              <thead className="bg-cool-ice/70 text-left text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">시간</th>
                  <th className="px-4 py-3">결과</th>
                  <th className="px-4 py-3">코드</th>
                  <th className="px-4 py-3">정규화</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">브라우저</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cool-mist bg-white/60">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      아직 접속 로그가 없습니다.
                    </td>
                  </tr>
                ) : null}
                {rows.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-cool-ink">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${resultStyles[log.result]}`}>
                        {resultLabels[log.result]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                      {log.normalized_preview ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {log.changed_by_normalization ? "변경됨" : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{log.request_region ?? "-"}</td>
                    <td className="max-w-md truncate px-4 py-3 text-slate-600" title={log.user_agent ?? undefined}>
                      {summarizeUserAgent(log.user_agent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-cool-mist bg-cool-ice p-4">
      <Icon className="text-cool-blue" size={20} aria-hidden="true" />
      <p className="mt-3 text-sm font-bold text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-black text-cool-ink">{value.toLocaleString("ko-KR")}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function summarizeUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return "-";
  }

  if (userAgent.includes("Chrome")) {
    return "Chrome";
  }

  if (userAgent.includes("Safari")) {
    return "Safari";
  }

  if (userAgent.includes("Firefox")) {
    return "Firefox";
  }

  return userAgent.slice(0, 80);
}
