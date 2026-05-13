export function ArtifactEditor() {
  return (
    <section className="rounded-lg border border-cool-mist bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-cool-blue">Artifacts</p>
      <h2 className="mt-2 text-xl font-bold text-cool-ink">자료 관리</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        실습 파일, 참고 자료, 외부 링크를 강의별로 등록할 준비 영역입니다.
      </p>
      <div className="mt-5 rounded-md border border-dashed border-cool-mist bg-cool-ice p-4 text-sm text-slate-600">
        업로드 URL 발급과 자료 저장은 다음 작업에서 연결됩니다.
      </div>
    </section>
  );
}
