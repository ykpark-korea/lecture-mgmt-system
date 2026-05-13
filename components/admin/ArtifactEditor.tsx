export function ArtifactEditor() {
  return (
    <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-cool-blue">Artifacts</p>
      <h2 className="mt-2 text-xl font-bold text-cool-ink">자료 관리</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        실습 파일, 참고 자료, 외부 링크를 강의별로 등록할 준비 영역입니다.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="자료 등록 입력 예시" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-lecture-id">
          강의 ID
          <input
            id="artifact-lecture-id"
            name="lectureId"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="lectureId"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-title">
          자료명
          <input
            id="artifact-title"
            name="title"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 실습 교안"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-type">
          유형
          <select
            id="artifact-type"
            name="type"
            disabled
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            defaultValue="file"
          >
            <option value="file">파일</option>
            <option value="link">링크</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-category">
          분류
          <select
            id="artifact-category"
            name="category"
            disabled
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            defaultValue="practice"
          >
            <option value="practice">실습</option>
            <option value="reference">참고</option>
            <option value="external">외부</option>
            <option value="preparation">사전 준비</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="artifact-target">
          URL 또는 저장 경로
          <input
            id="artifact-target"
            name="urlOrStoragePath"
            readOnly
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="https://... 또는 upload-url path"
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
