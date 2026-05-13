export function CodeManager() {
  return (
    <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-cool-blue">Access Codes</p>
      <h2 className="mt-2 text-xl font-bold text-cool-ink">접속 코드 발급</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        수강 기간과 연결 강의를 지정하는 코드 생성 폼이 이 영역에 확장됩니다.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="접속 코드 생성 입력 예시" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-name">
          코드명
          <input
            id="code-name"
            name="name"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 5월 모집인 과정"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-value">
          코드
          <input
            id="code-value"
            name="code"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="HANWHA-2026"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-starts-at">
          시작 일시
          <input
            id="code-starts-at"
            name="startsAt"
            type="datetime-local"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-ends-at">
          종료 일시
          <input
            id="code-ends-at"
            name="endsAt"
            type="datetime-local"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="code-notes">
          메모
          <textarea
            id="code-notes"
            name="notes"
            readOnly
            className="mt-2 min-h-20 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="운영자가 확인할 내부 메모"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            className="rounded-md bg-cool-blue px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            API 연결 대기
          </button>
        </div>
      </div>
    </section>
  );
}
