import Image from "next/image";

type HomeProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const hasInvalidCode = params?.error === "invalid-code";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/80 bg-white/95 shadow-soft ring-1 ring-cool-mist/70 backdrop-blur lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative order-2 min-h-56 border-t border-cool-mist bg-cool-ice lg:order-1 lg:min-h-[34rem] lg:border-r lg:border-t-0">
          <Image
            src="/hero-full.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 36rem, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cool-ink/18 via-transparent to-white/20" />
        </div>
        <div className="order-1 flex items-center p-7 sm:p-9 lg:order-2 lg:p-10">
          <div className="w-full">
            <div className="mb-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-cool-mint via-cool-blue to-hanwha-orange" />
            <div className="mb-8">
              <p className="text-sm font-semibold text-cool-blue">Hanwha Lecture Portal</p>
              <h1 className="mt-3 text-3xl font-bold tracking-normal text-cool-ink">
                사내강의 접속
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                안내받은 입장 코드를 입력하면 신청 가능한 강의 목록을 확인할 수 있습니다.
              </p>
            </div>

            <form action="/api/learner/login" method="POST" className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-cool-ink">
                  접속 코드
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="mt-2 w-full rounded-md border border-cool-mist bg-cool-ice/80 px-4 py-3 text-cool-ink outline-none transition placeholder:text-slate-400 focus:border-cool-blue focus:bg-white focus:ring-4 focus:ring-cool-blue/15"
                  placeholder="코드를 입력하세요"
                />
                {hasInvalidCode ? (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    유효하지 않거나 기간이 만료된 코드입니다.
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-cool-blue px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-cool-blue/25"
              >
                강의 목록 보기
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
