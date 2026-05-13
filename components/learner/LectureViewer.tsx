"use client";

import { useRef } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";

type LectureViewerProps = {
  lectureId: string;
  title: string;
};

export default function LectureViewer({ lectureId, title }: LectureViewerProps) {
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const lectureUrl = `/api/lectures/${lectureId}/signed-url`;

  async function openFullscreen() {
    const target = frameWrapRef.current;

    if (target?.requestFullscreen) {
      await target.requestFullscreen();
      return;
    }

    window.open(lectureUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="overflow-hidden rounded-lg border border-white/80 bg-white/92 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-cool-mist bg-white/90 px-5 py-4">
        <p className="text-[21px] font-black leading-none text-cool-ink">강의 자료</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openFullscreen}
            className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink transition hover:border-cool-blue/50 hover:bg-white hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            title="전체 화면"
          >
            <Maximize2 aria-hidden="true" size={16} />
            전체 보기
          </button>
          <a
            href={lectureUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-cool-mist bg-white p-2 text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            title="새 탭에서 열기"
          >
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        </div>
      </div>
      <div ref={frameWrapRef} className="bg-white">
        <iframe
          src={lectureUrl}
          title={title}
          sandbox="allow-scripts allow-downloads allow-forms allow-popups allow-same-origin"
          referrerPolicy="no-referrer"
          className="h-[70vh] min-h-[520px] w-full bg-white"
        />
      </div>
    </section>
  );
}
