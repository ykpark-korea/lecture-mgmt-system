type LectureViewerProps = {
  lectureId: string;
  title: string;
};

export default function LectureViewer({ lectureId, title }: LectureViewerProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-cool-mist bg-white shadow-soft">
      <div className="border-b border-cool-mist bg-white/90 px-5 py-4">
        <p className="text-sm font-semibold text-cool-ink">강의 플레이어</p>
      </div>
      <iframe
        src={`/api/lectures/${lectureId}/signed-url`}
        title={title}
        sandbox="allow-scripts allow-downloads allow-forms allow-popups"
        referrerPolicy="no-referrer"
        className="h-[70vh] min-h-[520px] w-full bg-white"
      />
    </section>
  );
}
