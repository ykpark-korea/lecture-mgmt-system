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
      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="강의 생성 입력 예시" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-title">
          강의명
          <input
            id="lecture-title"
            name="title"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 장기보험 핵심 실습"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-status">
          상태
          <select
            id="lecture-status"
            name="status"
            disabled
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            defaultValue="draft"
          >
            <option value="draft">초안</option>
            <option value="active">공개</option>
            <option value="inactive">비공개</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="lecture-description">
          설명
          <textarea
            id="lecture-description"
            name="description"
            readOnly
            className="mt-2 min-h-24 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="강의 카드와 관리자 목록에 표시할 간단한 설명"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-html-path">
          HTML 저장 경로
          <input
            id="lecture-html-path"
            name="htmlStoragePath"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="upload-url 발급 후 path"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-sort-order">
          정렬 순서
          <input
            id="lecture-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            defaultValue="0"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
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
