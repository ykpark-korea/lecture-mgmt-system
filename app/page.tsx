export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-lg border border-cool-mist bg-white/88 p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold text-hanwha-orange">Hanwha Lecture Portal</p>
          <h1 className="mt-3 text-3xl font-bold text-cool-ink">수강자 로그인</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            안내받은 입장 코드를 입력하면 신청 가능한 강의 목록을 확인할 수 있습니다.
          </p>
        </div>

        <form action="/api/learner/login" method="POST" className="space-y-5">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-cool-ink">
              입장 코드
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              className="mt-2 w-full rounded-md border border-cool-mist bg-cool-ice px-4 py-3 text-cool-ink outline-none transition focus:border-hanwha-orange focus:ring-4 focus:ring-orange-100"
              placeholder="코드를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-hanwha-orange px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
          >
            강의 목록 보기
          </button>
        </form>
      </section>
    </main>
  );
}
