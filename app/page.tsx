import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

type HomeProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const hasInvalidCode = params?.error === "invalid-code";

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-navy">
            <Sparkles aria-hidden="true" size={16} className="text-cool-aqua" />
            Summer Cool Learning Portal
          </div>
          <div>
            <p className="text-sm font-bold text-cool-blue">Hanwha General Insurance</p>
            <h1 className="mt-3 text-4xl font-black tracking-normal text-cool-ink sm:text-5xl">
              사내강의 접속
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              안내받은 입장 코드를 입력하고 필요한 강의, 실습 자료, 참고 링크를 한 화면에서 확인하세요.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-cool-mist bg-white p-4 shadow-soft">
            <form action="/api/learner/login" method="POST" className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-cool-ink">
                  접속 코드
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="mt-2 w-full rounded-md border border-cool-mist bg-cool-ice/70 px-4 py-3.5 text-lg font-bold uppercase tracking-wide text-cool-ink outline-none transition placeholder:text-slate-400 focus:border-cool-blue focus:bg-white focus:ring-4 focus:ring-cool-blue/15"
                  placeholder="예: HW-260514"
                />
                {hasInvalidCode ? (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    유효하지 않거나 기간이 만료된 코드입니다.
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cool-navy px-4 py-3.5 font-bold text-white shadow-float transition hover:bg-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/25"
              >
                강의 목록 보기
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-cool-mist bg-cool-ice/70 p-4 text-sm leading-6 text-slate-600">
            <ShieldCheck aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-cool-blue" />
            기간제 코드로만 접근하며, 강의 자료와 첨부파일은 비공개 스토리지에서 안전하게 제공됩니다.
          </div>
        </div>

        <div className="rounded-lg border border-white/80 bg-white/72 p-4 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl sm:p-5">
          <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-white via-cool-ice to-cool-sky/60 lg:min-h-[42rem]">
            <Image
              src="/hero-full.png"
              alt="한화손보 사내강의 대표 이미지"
              fill
              priority
              sizes="(min-width: 1024px) 54rem, 100vw"
              className="object-contain p-3 sm:p-5"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
