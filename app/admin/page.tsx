import { AdminShell } from "@/components/admin/AdminShell";
import Link from "next/link";

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
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              className="rounded-lg border border-cool-mist bg-cool-ice p-4 transition hover:border-cool-blue/60 hover:bg-white"
              href="/admin/lectures"
            >
              <span className="text-sm font-bold text-cool-ink">강좌 개설</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">HTML 강의자료와 자료 패널을 등록합니다.</span>
            </Link>
            <Link
              className="rounded-lg border border-cool-mist bg-cool-ice p-4 transition hover:border-cool-blue/60 hover:bg-white"
              href="/admin/codes"
            >
              <span className="text-sm font-bold text-cool-ink">접속 코드 운영</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">수강 기간과 공개 강좌 연결을 관리합니다.</span>
            </Link>
          </div>
        </section>
        <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
          <h2 className="text-lg font-bold">오늘의 작업</h2>
          <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <li>
              <span className="font-semibold text-cool-ink">1. 강의 관리</span>
              <span className="block">강좌를 만들고 HTML 파일을 업로드합니다.</span>
            </li>
            <li>
              <span className="font-semibold text-cool-ink">2. 자료 관리</span>
              <span className="block">실습 파일과 참고 링크를 강좌에 연결합니다.</span>
            </li>
            <li>
              <span className="font-semibold text-cool-ink">3. 접속 코드</span>
              <span className="block">수강 코드를 만들고 강좌를 연결합니다.</span>
            </li>
          </ol>
        </section>
      </div>
    </AdminShell>
  );
}
