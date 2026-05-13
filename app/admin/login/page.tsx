type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid-code";

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10 text-cool-ink">
      <form
        className="w-full max-w-5xl overflow-hidden rounded-lg border border-white/80 bg-white/88 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl lg:grid lg:grid-cols-[1fr_0.95fr]"
        action="/api/admin/login"
        method="post"
      >
        <div className="p-7 sm:p-9">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-bold text-cool-navy">
          <ShieldCheck aria-hidden="true" size={16} className="text-cool-blue" />
          Admin Secure Entry
        </div>
        <p className="text-sm font-semibold text-cool-blue">Admin</p>
        <h1 className="mt-2 text-3xl font-black">관리자 접속</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">강좌, 자료, 접속 코드를 운영할 관리자 코드를 입력해 주세요.</p>

        {hasError ? (
          <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            관리자 코드를 다시 확인해 주세요.
          </p>
        ) : null}

        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="code">
          관리자 코드
        </label>
        <input
          id="code"
          name="code"
          className="mt-2 w-full rounded-md border border-cool-mist bg-cool-ice/70 px-4 py-3 text-lg font-bold focus:border-cool-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          required
          autoComplete="one-time-code"
        />
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cool-navy px-4 py-3 font-bold text-white shadow-float transition hover:bg-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/25"
          type="submit"
        >
          <LockKeyhole aria-hidden="true" size={18} />
          접속
        </button>
        </div>
        <div className="relative hidden min-h-[32rem] items-center justify-center bg-gradient-to-br from-cool-ice via-white to-cool-sky/70 p-5 lg:flex">
          <Image src="/hero-wide.png" alt="한화손보 사내강의 배너" fill priority sizes="36rem" className="object-contain p-6" />
        </div>
      </form>
    </main>
  );
}
import { LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
