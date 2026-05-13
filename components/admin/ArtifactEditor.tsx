"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileUp, LinkIcon, Loader2, Plus, RefreshCw } from "lucide-react";

type ArtifactType = "file" | "link";
type ArtifactCategory = "practice" | "reference" | "external" | "preparation";

type Lecture = {
  id: string;
  title: string;
  status: string;
  sort_order: number;
};

type Artifact = {
  id: string;
  lecture_id: string;
  type: ArtifactType;
  category: ArtifactCategory;
  title: string;
  description: string;
  url: string | null;
  storage_path: string | null;
  is_active: boolean;
  sort_order: number;
};

const emptyForm = {
  lectureId: "",
  title: "",
  description: "",
  type: "file" as ArtifactType,
  category: "practice" as ArtifactCategory,
  url: "",
  sortOrder: "0",
  isActive: true
};

export function ArtifactEditor() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setMessage("");

    try {
      const [lecturesResponse, artifactsResponse] = await Promise.all([
        fetch("/api/admin/lectures"),
        fetch("/api/admin/artifacts")
      ]);
      const [lecturesData, artifactsData] = await Promise.all([lecturesResponse.json(), artifactsResponse.json()]);

      if (!lecturesResponse.ok) throw new Error(lecturesData.error ?? "강좌 목록을 불러오지 못했습니다.");
      if (!artifactsResponse.ok) throw new Error(artifactsData.error ?? "자료 목록을 불러오지 못했습니다.");

      setLectures(lecturesData.lectures ?? []);
      setArtifacts(artifactsData.artifacts ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "자료 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadFileIfNeeded() {
    if (form.type !== "file") {
      return undefined;
    }

    if (!file) {
      throw new Error("업로드할 파일을 선택해 주세요.");
    }

    const response = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "lecture-artifacts",
        ownerId: form.lectureId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream"
      })
    });
    const uploadData = await response.json();

    if (!response.ok) {
      throw new Error(uploadData.error ?? "파일 업로드 URL 발급에 실패했습니다.");
    }

    const uploadResponse = await fetch(uploadData.upload.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadData.upload.contentType },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error("파일 업로드에 실패했습니다.");
    }

    return uploadData.path as string;
  }

  async function createArtifact() {
    if (!form.lectureId || !form.title.trim()) {
      setMessage("강좌와 자료명을 입력해 주세요.");
      return;
    }

    if (form.type === "link" && !form.url.trim()) {
      setMessage("링크 URL을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const storagePath = await uploadFileIfNeeded();
      const response = await fetch("/api/admin/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: form.lectureId,
          title: form.title,
          description: form.description,
          type: form.type,
          category: form.category,
          sortOrder: Number.parseInt(form.sortOrder || "0", 10),
          isActive: form.isActive,
          ...(form.type === "link" ? { url: form.url } : { storagePath })
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "자료 등록에 실패했습니다.");
      }

      setArtifacts((current) => [...current, data.artifact as Artifact].sort((a, b) => a.sort_order - b.sort_order));
      setForm((current) => ({ ...emptyForm, lectureId: current.lectureId }));
      setFile(null);
      setMessage("자료를 등록했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "자료 등록에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  const filteredArtifacts = form.lectureId
    ? artifacts.filter((artifact) => artifact.lecture_id === form.lectureId)
    : artifacts;

  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cool-blue">Artifacts</p>
          <h2 className="mt-2 text-xl font-bold text-cool-ink">자료 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">실습 파일, 참고 자료, 외부 링크를 강의별로 등록합니다.</p>
        </div>
        {isLoading ? <Loader2 size={18} className="animate-spin text-cool-blue" aria-hidden="true" /> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={loadData} className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-3 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice">
          <RefreshCw size={16} aria-hidden="true" />
          새로고침
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="자료 등록 입력" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-lecture-id">
          강좌
          <select id="artifact-lecture-id" name="lectureId" value={form.lectureId} onChange={(event) => updateForm("lectureId", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
            <option value="">강좌 선택</option>
            {lectures.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>{lecture.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-title">
          자료명
          <input id="artifact-title" name="title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="예: 실습 교안" />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-type">
          유형
          <select id="artifact-type" name="type" value={form.type} onChange={(event) => updateForm("type", event.target.value as ArtifactType)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
            <option value="file">파일</option>
            <option value="link">링크</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-category">
          분류
          <select id="artifact-category" name="category" value={form.category} onChange={(event) => updateForm("category", event.target.value as ArtifactCategory)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
            <option value="practice">실습</option>
            <option value="reference">참고</option>
            <option value="external">외부</option>
            <option value="preparation">사전 준비</option>
          </select>
        </label>
        {form.type === "link" ? (
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="artifact-url">
            URL
            <input id="artifact-url" name="url" value={form.url} onChange={(event) => updateForm("url", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="https://..." />
          </label>
        ) : (
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="artifact-file">
            파일
            <input id="artifact-file" name="file" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cool-ice file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cool-blue focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
          </label>
        )}
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="artifact-description">
          설명
          <textarea id="artifact-description" value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="mt-2 min-h-20 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="자료 패널에 표시할 설명" />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="artifact-sort-order">
          정렬 순서
          <input id="artifact-sort-order" type="number" min="0" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
        </label>
        <label className="inline-flex items-center gap-2 self-end text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} className="size-4 rounded border-cool-mist text-cool-blue" />
          활성화
        </label>
        <div className="sm:col-span-2">
          <button type="button" onClick={createArtifact} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            자료 등록
          </button>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink">{message}</p> : null}

      <div className="mt-6 border-t border-cool-mist pt-5">
        <h3 className="text-sm font-bold text-cool-ink">등록된 자료</h3>
        <div className="mt-3 grid gap-2">
          {!isLoading && filteredArtifacts.length === 0 ? <p className="rounded-md border border-dashed border-cool-mist px-3 py-4 text-sm text-slate-500">아직 등록된 자료가 없습니다.</p> : null}
          {filteredArtifacts.map((artifact) => (
            <div key={artifact.id} className="rounded-md border border-cool-mist bg-white px-3 py-3">
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-cool-ink">
                  {artifact.type === "link" ? <LinkIcon size={15} aria-hidden="true" /> : <FileUp size={15} aria-hidden="true" />}
                  {artifact.title}
                </span>
                <span className="text-xs font-semibold text-slate-500">{artifact.category}</span>
              </span>
              {artifact.url ? <a href={artifact.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cool-blue"><ExternalLink size={13} aria-hidden="true" />링크 열기</a> : null}
              {artifact.storage_path ? <p className="mt-1 text-xs text-slate-500">{artifact.storage_path}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
