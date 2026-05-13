export function CodeManager() {
  return (
    <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-cool-blue">Access Codes</p>
      <h2 className="mt-2 text-xl font-bold text-cool-ink">접속 코드 발급</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        수강 기간과 연결 강의를 지정하는 코드 생성 폼이 이 영역에 확장됩니다.
      </p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-name">
          코드명
          <input
            id="code-name"
            name="name"
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 5월 모집인 과정"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-value">
          코드
          <input
            id="code-value"
            name="code"
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="HANWHA-2026"
          />
        </label>
      </form>
    </section>
  );
}
