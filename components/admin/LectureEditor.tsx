"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Plus, RefreshCw, Save } from "lucide-react";
import { detectLectureMaterialType, getLectureMaterialTypeLabel } from "@/src/lib/materials";
import type { LectureMaterialType } from "@/src/types/database";

type LectureStatus = "draft" | "active" | "inactive";

type Lecture = {
  id: string;
  title: string;
  description: string;
  status: LectureStatus;
  html_storage_path: string | null;
  material_type: LectureMaterialType;
  material_storage_path: string | null;
  display_pdf_storage_path: string | null;
  thumbnail_storage_path: string | null;
  uses_default_hero: boolean;
  published_starts_at: string | null;
  published_ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  title: "",
  description: "",
  status: "draft" as LectureStatus,
  sortOrder: "0",
  materialType: "html" as LectureMaterialType,
  materialStoragePath: "",
  displayPdfStoragePath: ""
};

export function LectureEditor() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [displayPdfFile, setDisplayPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedLecture = useMemo(
    () => lectures.find((lecture) => lecture.id === selectedLectureId) ?? null,
    [lectures, selectedLectureId]
  );

  useEffect(() => {
    void loadLectures();
  }, []);

  async function loadLectures() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/lectures");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "강좌 목록을 불러오지 못했습니다.");
      }

      setLectures(data.lectures ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "강좌 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectLecture(lecture: Lecture) {
    setSelectedLectureId(lecture.id);
    setForm({
      title: lecture.title,
      description: lecture.description,
      status: lecture.status,
      sortOrder: String(lecture.sort_order),
      materialType: lecture.material_type ?? "html",
      materialStoragePath: lecture.material_storage_path ?? lecture.html_storage_path ?? "",
      displayPdfStoragePath: lecture.display_pdf_storage_path ?? ""
    });
    setMaterialFile(null);
    setDisplayPdfFile(null);
    setMessage("");
  }

  function resetForm() {
    setSelectedLectureId("");
    setForm(emptyForm);
    setMaterialFile(null);
    setDisplayPdfFile(null);
    setMessage("");
  }

  function selectMaterialFile(file: File | null) {
    setMaterialFile(file);

    if (!file) {
      return;
    }

    const detectedType = detectLectureMaterialType(file.name);

    if (detectedType) {
      updateForm("materialType", detectedType);
    }
  }

  async function uploadLectureFileIfNeeded(file: File | null, fallbackPath: string, fallbackContentType: string, ownerId: string) {
    if (!file) {
      return fallbackPath.trim() || undefined;
    }

    const response = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "lecture-html",
        ownerId,
        fileName: file.name,
        contentType: file.type || fallbackContentType
      })
    });
    const uploadData = await response.json();

    if (!response.ok) {
      throw new Error(uploadData.error ?? "강의자료 업로드 URL 발급에 실패했습니다.");
    }

    const uploadResponse = await fetch(uploadData.upload.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadData.upload.contentType },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error("강의자료 파일 업로드에 실패했습니다.");
    }

    return uploadData.path as string;
  }

  async function createLecture() {
    await saveLecture("create");
  }

  async function updateLecture() {
    await saveLecture("update");
  }

  async function saveLecture(mode: "create" | "update") {
    if (!form.title.trim()) {
      setMessage("강의명을 입력해 주세요.");
      return;
    }

    if (mode === "update" && !selectedLecture) {
      setMessage("수정할 강좌를 먼저 선택해 주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const uploadOwnerId = selectedLecture?.id ?? crypto.randomUUID();
      const materialStoragePath = await uploadLectureFileIfNeeded(
        materialFile,
        form.materialStoragePath,
        form.materialType === "html" ? "text/html" : "application/octet-stream",
        uploadOwnerId
      );
      const displayPdfStoragePath = await uploadLectureFileIfNeeded(
        displayPdfFile,
        form.displayPdfStoragePath,
        "application/pdf",
        uploadOwnerId
      );
      const body = {
        ...(mode === "update" ? { id: selectedLecture?.id } : {}),
        title: form.title,
        description: form.description,
        status: form.status,
        sortOrder: Number.parseInt(form.sortOrder || "0", 10),
        materialType: form.materialType,
        ...(materialStoragePath ? { materialStoragePath } : {}),
        ...(form.materialType === "html" && materialStoragePath ? { htmlStoragePath: materialStoragePath } : {}),
        ...(displayPdfStoragePath ? { displayPdfStoragePath } : {})
      };
      const response = await fetch("/api/admin/lectures", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "강좌 저장에 실패했습니다.");
      }

      const savedLecture = data.lecture as Lecture;
      setLectures((current) =>
        mode === "create"
          ? [...current, savedLecture].sort((a, b) => a.sort_order - b.sort_order)
          : current.map((lecture) => (lecture.id === savedLecture.id ? savedLecture : lecture))
      );
      selectLecture(savedLecture);
      setMessage(mode === "create" ? "새 강좌를 만들었습니다." : "강좌를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "강좌 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div>
        <p className="text-sm font-semibold text-cool-blue">Lecture</p>
        <h2 className="mt-2 text-xl font-bold text-cool-ink">강좌 만들기</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          HTML, PDF, PPT, PPTX 강의자료를 업로드하고 공개 상태를 바로 관리합니다.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-3 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice"
        >
          <Plus size={16} aria-hidden="true" />
          새 입력
        </button>
        <button
          type="button"
          onClick={loadLectures}
          className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-3 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice"
        >
          <RefreshCw size={16} aria-hidden="true" />
          새로고침
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="강의 생성 입력" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-title">
          강의명
          <input
            id="lecture-title"
            name="title"
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="예: 장기보험 핵심 실습"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-status">
          상태
          <select
            id="lecture-status"
            name="status"
            value={form.status}
            onChange={(event) => updateForm("status", event.target.value as LectureStatus)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
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
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
            className="mt-2 min-h-24 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
            placeholder="강의 카드와 관리자 목록에 표시할 간단한 설명"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-material-file">
          강의자료
          <input
            id="lecture-material-file"
            name="materialFile"
            type="file"
            accept=".html,.pdf,.ppt,.pptx,text/html,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={(event) => selectMaterialFile(event.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cool-ice file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cool-blue focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          />
          {form.materialStoragePath ? <span className="mt-1 block text-xs font-normal text-slate-500">{form.materialStoragePath}</span> : null}
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-material-type">
          자료 유형
          <select
            id="lecture-material-type"
            name="materialType"
            value={form.materialType}
            onChange={(event) => updateForm("materialType", event.target.value as LectureMaterialType)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          >
            <option value="html">HTML</option>
            <option value="pdf">PDF</option>
            <option value="ppt">PPT</option>
            <option value="pptx">PPTX</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="lecture-display-pdf-file">
          표시용 PDF
          <input
            id="lecture-display-pdf-file"
            name="displayPdfFile"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => setDisplayPdfFile(event.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cool-ice file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cool-blue focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            PPT/PPTX는 표시용 PDF가 있으면 학습자 화면에서 키보드로 페이지를 넘길 수 있습니다.
            {form.displayPdfStoragePath ? ` 현재 파일: ${form.displayPdfStoragePath}` : ""}
          </span>
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="lecture-sort-order">
          정렬 순서
          <input
            id="lecture-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) => updateForm("sortOrder", event.target.value)}
            className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={createLecture}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            새 강좌 만들기
          </button>
          <button
            type="button"
            onClick={updateLecture}
            disabled={isSaving || !selectedLecture}
            className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-4 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} aria-hidden="true" />
            선택 강좌 저장
          </button>
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink">
          {message}
        </p>
      ) : null}

      <div className="mt-6 border-t border-cool-mist pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-cool-ink">등록된 강좌</h3>
          {isLoading ? <Loader2 size={16} className="animate-spin text-cool-blue" aria-hidden="true" /> : null}
        </div>
        <div className="mt-3 grid gap-2">
          {!isLoading && lectures.length === 0 ? (
            <p className="rounded-md border border-dashed border-cool-mist px-3 py-4 text-sm text-slate-500">
              아직 등록된 강좌가 없습니다.
            </p>
          ) : null}
          {lectures.map((lecture) => (
            <button
              key={lecture.id}
              type="button"
              onClick={() => selectLecture(lecture)}
              className={`rounded-md border px-3 py-3 text-left transition ${
                lecture.id === selectedLectureId
                  ? "border-cool-blue bg-cool-ice"
                  : "border-cool-mist bg-white hover:bg-cool-ice"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-cool-ink">{lecture.title}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                  {lecture.material_storage_path || lecture.html_storage_path ? <FileUp size={14} aria-hidden="true" /> : null}
                  {getLectureMaterialTypeLabel(lecture.material_type ?? "html")}
                  {lecture.status === "active" ? <CheckCircle2 size={14} className="text-cool-blue" aria-hidden="true" /> : null}
                  {lecture.status}
                </span>
              </span>
              {lecture.description ? <span className="mt-1 block text-xs text-slate-500">{lecture.description}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
