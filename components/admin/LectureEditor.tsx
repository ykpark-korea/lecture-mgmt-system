export function LectureEditor() {
  return (
    <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
      <div>
        <p className="text-sm font-semibold text-cool-blue">Lecture</p>
        <h2 className="mt-2 text-xl font-bold text-cool-ink">강의 편집</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          강의 제목, 공개 상태, HTML 업로드 항목을 다음 단계에서 연결합니다.
        </p>
      </div>
      <form className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-title">
          강의명
          <input
            id="lecture-title"
            name="title"
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 장기보험 핵심 실습"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-status">
          상태
          <select
            id="lecture-status"
            name="status"
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            defaultValue="draft"
          >
            <option value="draft">초안</option>
            <option value="active">공개</option>
            <option value="inactive">비공개</option>
          </select>
        </label>
      </form>
    </section>
  );
}
