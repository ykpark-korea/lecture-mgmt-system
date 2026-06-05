"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileWarning } from "lucide-react";
import type { LectureMaterialType } from "@/src/types/database";
import { getLectureMaterialTypeLabel } from "@/src/lib/materials";

type LectureViewerProps = {
  lectureId: string;
  title: string;
  materialType: LectureMaterialType;
  hasDisplayPdf: boolean;
};

type PdfDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPage>;
  destroy(): Promise<void>;
};

type PdfPage = {
  getViewport(options: { scale: number }): { width: number; height: number };
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): {
    promise: Promise<void>;
    cancel(): void;
  };
};

export default function LectureViewer({ lectureId, title, materialType, hasDisplayPdf }: LectureViewerProps) {
  const lectureUrl = `/api/lectures/${lectureId}/signed-url`;
  const sourceUrl = `/api/lectures/${lectureId}/source`;
  const shouldRenderHtml = materialType === "html";
  const shouldRenderPdf = materialType === "pdf" || ((materialType === "ppt" || materialType === "pptx") && hasDisplayPdf);
  const canPreview = shouldRenderHtml || shouldRenderPdf;

  return (
    <section className="overflow-hidden rounded-lg border border-white/80 bg-white/92 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-cool-mist bg-white/90 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[21px] font-black leading-none text-cool-ink">강의 자료</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{getLectureMaterialTypeLabel(materialType)}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={sourceUrl}
            className="inline-flex items-center justify-center rounded-md border border-cool-mist bg-white p-2 text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            title="원본 다운로드"
          >
            <Download aria-hidden="true" size={16} />
          </a>
          {canPreview ? (
            <a
              href={lectureUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-cool-mist bg-white p-2 text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
              title="새 탭에서 열기"
            >
              <ExternalLink aria-hidden="true" size={16} />
            </a>
          ) : null}
        </div>
      </div>
      {shouldRenderHtml ? <HtmlLectureFrame lectureUrl={lectureUrl} title={title} /> : null}
      {shouldRenderPdf ? <PdfLectureFrame lectureUrl={lectureUrl} title={title} /> : null}
      {!canPreview ? <UnsupportedLectureMaterial sourceUrl={sourceUrl} materialType={materialType} /> : null}
    </section>
  );
}

function HtmlLectureFrame({ lectureUrl, title }: { lectureUrl: string; title: string }) {
  return (
    <div className="bg-white">
      <iframe
        src={lectureUrl}
        title={title}
        sandbox="allow-scripts allow-downloads allow-forms allow-popups allow-same-origin"
        referrerPolicy="no-referrer"
        className="h-[70vh] min-h-[520px] w-full bg-white"
      />
    </div>
  );
}

function PdfLectureFrame({ lectureUrl, title }: { lectureUrl: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const goToPreviousPage = useCallback(() => {
    setPageNumber((current) => Math.max(1, current - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((current) => (pageCount > 0 ? Math.min(pageCount, current + 1) : current + 1));
  }, [pageCount]);

  useEffect(() => {
    let isMounted = true;
    let loadedDocument: PdfDocument | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setError("");

      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const task = pdfjs.getDocument({ url: lectureUrl, withCredentials: true });
        loadedDocument = await task.promise as PdfDocument;

        if (!isMounted) {
          await loadedDocument.destroy();
          return;
        }

        setPdfDocument(loadedDocument);
        setPageCount(loadedDocument.numPages);
        setPageNumber(1);
      } catch {
        if (isMounted) {
          setError("PDF 강의자료를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      isMounted = false;
      void loadedDocument?.destroy();
    };
  }, [lectureUrl]);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) {
      return;
    }

    let renderTask: ReturnType<PdfPage["render"]> | null = null;
    const activeDocument = pdfDocument;

    async function renderPage() {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const page = await activeDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(320, (containerRef.current?.clientWidth ?? 960) - 48);
      const scale = Math.min(1.8, Math.max(0.75, availableWidth / baseViewport.width));
      const viewport = page.getViewport({ scale });
      const pixelRatio = window.devicePixelRatio || 1;
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
    }

    void renderPage().catch(() => {
      setError("PDF 페이지를 표시하지 못했습니다.");
    });

    return () => {
      renderTask?.cancel();
    };
  }, [pdfDocument, pageNumber]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (target?.closest("input, textarea, select, button, a")) {
        return;
      }

      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goToNextPage();
      }

      if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
        event.preventDefault();
        goToPreviousPage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNextPage, goToPreviousPage]);

  return (
    <div ref={containerRef} className="bg-cool-ice/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cool-mist bg-white/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="inline-flex items-center gap-1.5 rounded-md border border-cool-mist bg-white px-3 py-2 text-sm font-bold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" size={16} />
            이전
          </button>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={pageCount > 0 && pageNumber >= pageCount}
            className="inline-flex items-center gap-1.5 rounded-md border border-cool-mist bg-white px-3 py-2 text-sm font-bold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
        <p className="text-sm font-bold text-slate-600">
          {pageCount > 0 ? `${pageNumber} / ${pageCount}` : "페이지 준비 중"}
        </p>
      </div>
      <div className="flex h-[70vh] min-h-[520px] items-start justify-center overflow-auto p-6">
        {isLoading ? <p className="mt-10 text-sm font-bold text-slate-500">PDF를 불러오는 중입니다.</p> : null}
        {error ? <p className="mt-10 text-sm font-bold text-rose-600">{error}</p> : null}
        {!isLoading && !error ? (
          <canvas ref={canvasRef} aria-label={`${title} PDF 강의자료`} className="max-w-full rounded-md bg-white shadow-soft" />
        ) : null}
      </div>
    </div>
  );
}

function UnsupportedLectureMaterial({ sourceUrl, materialType }: { sourceUrl: string; materialType: LectureMaterialType }) {
  return (
    <div className="flex h-[70vh] min-h-[520px] items-center justify-center bg-cool-ice/60 p-6">
      <div className="max-w-md rounded-lg border border-cool-mist bg-white p-6 text-center shadow-soft">
        <FileWarning className="mx-auto text-hanwha-orange" size={34} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-black text-cool-ink">표시용 PDF가 필요합니다</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getLectureMaterialTypeLabel(materialType)} 원본은 저장되어 있습니다. 관리자 화면에서 표시용 PDF를 추가하면
          키보드로 페이지를 넘길 수 있습니다.
        </p>
        <a
          href={sourceUrl}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blue-600"
        >
          <Download aria-hidden="true" size={16} />
          원본 다운로드
        </a>
      </div>
    </div>
  );
}
