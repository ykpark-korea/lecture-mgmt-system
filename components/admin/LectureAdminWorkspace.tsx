"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileUp,
  LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { detectLectureMaterialType, getLectureMaterialTypeLabel } from "@/src/lib/materials";
import type { LectureMaterialType } from "@/src/types/database";

type LectureStatus = "draft" | "active" | "inactive";
type ArtifactType = "file" | "link";
type ArtifactCategory = "practice" | "reference" | "external" | "preparation";
type WorkspaceTab = "basic" | "material" | "artifacts" | "codes";

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

type AccessCode = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  notes: string | null;
};

type LectureAccessLink = {
  id: string;
  lecture_id: string;
  access_code_id: string;
  sort_order: number;
};

const emptyLectureForm = {
  title: "",
  description: "",
  status: "draft" as LectureStatus,
  sortOrder: "0",
  materialType: "html" as LectureMaterialType,
  materialStoragePath: "",
  displayPdfStoragePath: ""
};

const emptyArtifactForm = {
  title: "",
  description: "",
  type: "file" as ArtifactType,
  category: "practice" as ArtifactCategory,
  url: "",
  sortOrder: "0",
  isActive: true
};

const statusFilters = [
  { value: "all", label: "전체" },
  { value: "active", label: "공개" },
  { value: "draft", label: "초안" },
  { value: "inactive", label: "비공개" }
] as const;

const tabItems: { value: WorkspaceTab; label: string }[] = [
  { value: "basic", label: "기본 정보" },
  { value: "material", label: "강의자료" },
  { value: "artifacts", label: "학습자료" },
  { value: "codes", label: "접속 코드" }
];

const categoryLabels: Record<ArtifactCategory, string> = {
  practice: "실습",
  reference: "참고",
  external: "외부",
  preparation: "사전 준비"
};

export function LectureAdminWorkspace() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [lectureLinks, setLectureLinks] = useState<LectureAccessLink[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [lectureForm, setLectureForm] = useState(emptyLectureForm);
  const [artifactForm, setArtifactForm] = useState(emptyArtifactForm);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [displayPdfFile, setDisplayPdfFile] = useState<File | null>(null);
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("basic");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]["value"]>("all");
  const [linkCodeId, setLinkCodeId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedLecture = useMemo(
    () => lectures.find((lecture) => lecture.id === selectedLectureId) ?? null,
    [lectures, selectedLectureId]
  );

  const selectedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.lecture_id === selectedLectureId),
    [artifacts, selectedLectureId]
  );

  const selectedLinks = useMemo(
    () => lectureLinks.filter((link) => link.lecture_id === selectedLectureId),
    [lectureLinks, selectedLectureId]
  );

  const selectedCodes = useMemo(
    () => selectedLinks
      .map((link) => accessCodes.find((code) => code.id === link.access_code_id))
      .filter((code): code is AccessCode => Boolean(code)),
    [accessCodes, selectedLinks]
  );

  const filteredLectures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return lectures.filter((lecture) => {
      const matchesStatus = statusFilter === "all" || lecture.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        lecture.title.toLowerCase().includes(normalizedQuery) ||
        lecture.description.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [lectures, query, statusFilter]);

  async function loadData(nextSelectedId = selectedLectureId) {
    setIsLoading(true);
    setMessage("");

    try {
      const [lecturesResponse, artifactsResponse, codesResponse, linksResponse] = await Promise.all([
        fetch("/api/admin/lectures"),
        fetch("/api/admin/artifacts"),
        fetch("/api/admin/codes"),
        fetch("/api/admin/lecture-access")
      ]);
      const [lecturesData, artifactsData, codesData, linksData] = await Promise.all([
        lecturesResponse.json(),
        artifactsResponse.json(),
        codesResponse.json(),
        linksResponse.json()
      ]);

      if (!lecturesResponse.ok) throw new Error(lecturesData.error ?? "강좌 목록을 불러오지 못했습니다.");
      if (!artifactsResponse.ok) throw new Error(artifactsData.error ?? "자료 목록을 불러오지 못했습니다.");
      if (!codesResponse.ok) throw new Error(codesData.error ?? "접속 코드 목록을 불러오지 못했습니다.");
      if (!linksResponse.ok) throw new Error(linksData.error ?? "강좌 연결 정보를 불러오지 못했습니다.");

      const loadedLectures = (lecturesData.lectures ?? []) as Lecture[];
      setLectures(loadedLectures);
      setArtifacts((artifactsData.artifacts ?? []) as Artifact[]);
      setAccessCodes((codesData.codes ?? []) as AccessCode[]);
      setLectureLinks((linksData.links ?? []) as LectureAccessLink[]);

      const nextLecture =
        loadedLectures.find((lecture) => lecture.id === nextSelectedId) ??
        loadedLectures[0] ??
        null;

      if (nextLecture) {
        selectLecture(nextLecture, false);
      } else {
        startNewLecture(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "강의 관리 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // Initial admin data load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectLecture(lecture: Lecture, clearMessage = true) {
    setSelectedLectureId(lecture.id);
    setLectureForm({
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
    setArtifactFile(null);
    setArtifactForm(emptyArtifactForm);
    setActiveTab("basic");
    setLinkCodeId("");
    if (clearMessage) setMessage("");
  }

  function startNewLecture(clearMessage = true) {
    setSelectedLectureId("");
    setLectureForm(emptyLectureForm);
    setMaterialFile(null);
    setDisplayPdfFile(null);
    setArtifactFile(null);
    setArtifactForm(emptyArtifactForm);
    setActiveTab("basic");
    setLinkCodeId("");
    if (clearMessage) setMessage("");
  }

  function updateLectureForm(field: keyof typeof lectureForm, value: string) {
    setLectureForm((current) => ({ ...current, [field]: value }));
  }

  function updateArtifactForm(field: keyof typeof artifactForm, value: string | boolean) {
    setArtifactForm((current) => ({ ...current, [field]: value }));
  }

  function selectMaterialFile(file: File | null) {
    setMaterialFile(file);

    if (!file) return;

    const detectedType = detectLectureMaterialType(file.name);
    if (detectedType) updateLectureForm("materialType", detectedType);
  }

  async function uploadLectureFileIfNeeded(file: File | null, fallbackPath: string, fallbackContentType: string, ownerId: string) {
    if (!file) return fallbackPath.trim() || undefined;

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

    if (!response.ok) throw new Error(uploadData.error ?? "강의자료 업로드 URL 발급에 실패했습니다.");

    const uploadResponse = await fetch(uploadData.upload.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadData.upload.contentType },
      body: file
    });

    if (!uploadResponse.ok) throw new Error("강의자료 파일 업로드에 실패했습니다.");

    return uploadData.path as string;
  }

  async function saveLecture() {
    if (!lectureForm.title.trim()) {
      setMessage("강의명을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const shouldKeepExistingMaterialPath = selectedLecture && !materialFile;
      const lectureBasePayload = {
        ...(selectedLecture ? { id: selectedLecture.id } : {}),
        title: lectureForm.title,
        description: lectureForm.description,
        status: lectureForm.status,
        sortOrder: Number.parseInt(lectureForm.sortOrder || "0", 10),
        materialType: lectureForm.materialType
      };
      const response = await fetch("/api/admin/lectures", {
        method: selectedLecture ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedLecture
            ? {
                ...lectureBasePayload,
                ...(shouldKeepExistingMaterialPath && lectureForm.materialStoragePath ? { materialStoragePath: lectureForm.materialStoragePath } : {}),
                ...(shouldKeepExistingMaterialPath && lectureForm.materialType === "html" && lectureForm.materialStoragePath
                  ? { htmlStoragePath: lectureForm.materialStoragePath }
                  : {}),
                ...(lectureForm.displayPdfStoragePath ? { displayPdfStoragePath: lectureForm.displayPdfStoragePath } : {})
              }
            : lectureBasePayload
        )
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "강좌 저장에 실패했습니다.");

      let savedLecture = data.lecture as Lecture;
      const materialStoragePath = await uploadLectureFileIfNeeded(
        materialFile,
        selectedLecture ? lectureForm.materialStoragePath : "",
        lectureForm.materialType === "html" ? "text/html" : "application/octet-stream",
        savedLecture.id
      );
      const displayPdfStoragePath = await uploadLectureFileIfNeeded(
        displayPdfFile,
        selectedLecture ? lectureForm.displayPdfStoragePath : "",
        "application/pdf",
        savedLecture.id
      );
      const needsMaterialPatch = Boolean(materialFile || displayPdfFile || (!selectedLecture && (materialStoragePath || displayPdfStoragePath)));

      if (needsMaterialPatch) {
        const materialResponse = await fetch("/api/admin/lectures", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: savedLecture.id,
            materialType: lectureForm.materialType,
            ...(materialStoragePath ? { materialStoragePath } : {}),
            ...(lectureForm.materialType === "html" && materialStoragePath ? { htmlStoragePath: materialStoragePath } : {}),
            ...(displayPdfStoragePath ? { displayPdfStoragePath } : {})
          })
        });
        const materialData = await materialResponse.json();

        if (!materialResponse.ok) throw new Error(materialData.error ?? "강의자료 저장에 실패했습니다.");

        savedLecture = materialData.lecture as Lecture;
      }

      setLectures((current) =>
        selectedLecture
          ? current.map((lecture) => (lecture.id === savedLecture.id ? savedLecture : lecture))
          : [...current, savedLecture].sort((a, b) => a.sort_order - b.sort_order)
      );
      selectLecture(savedLecture, false);
      setMessage(selectedLecture ? "강좌를 저장했습니다." : "새 강좌를 만들었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "강좌 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleSelectedLectureStatus() {
    if (!selectedLecture) return;

    const nextStatus: LectureStatus = selectedLecture.status === "active" ? "inactive" : "active";
    updateLectureForm("status", nextStatus);
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/lectures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedLecture.id, status: nextStatus })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "상태 변경에 실패했습니다.");

      const savedLecture = data.lecture as Lecture;
      setLectures((current) => current.map((lecture) => (lecture.id === savedLecture.id ? savedLecture : lecture)));
      selectLecture(savedLecture, false);
      setMessage(nextStatus === "active" ? "강좌를 공개 상태로 변경했습니다." : "강좌를 비공개 상태로 변경했습니다.");
    } catch (error) {
      updateLectureForm("status", selectedLecture.status);
      setMessage(error instanceof Error ? error.message : "상태 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadArtifactFileIfNeeded() {
    if (artifactForm.type !== "file") return undefined;
    if (!selectedLecture) throw new Error("강좌를 먼저 선택해 주세요.");
    if (!artifactFile) throw new Error("업로드할 파일을 선택해 주세요.");

    const response = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "lecture-artifacts",
        ownerId: selectedLecture.id,
        fileName: artifactFile.name,
        contentType: artifactFile.type || "application/octet-stream"
      })
    });
    const uploadData = await response.json();

    if (!response.ok) throw new Error(uploadData.error ?? "파일 업로드 URL 발급에 실패했습니다.");

    const uploadResponse = await fetch(uploadData.upload.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": uploadData.upload.contentType },
      body: artifactFile
    });

    if (!uploadResponse.ok) throw new Error("파일 업로드에 실패했습니다.");

    return uploadData.path as string;
  }

  async function createArtifact() {
    if (!selectedLecture) {
      setMessage("자료를 등록할 강좌를 먼저 선택해 주세요.");
      return;
    }

    if (!artifactForm.title.trim()) {
      setMessage("자료명을 입력해 주세요.");
      return;
    }

    if (artifactForm.type === "link" && !artifactForm.url.trim()) {
      setMessage("링크 URL을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const storagePath = await uploadArtifactFileIfNeeded();
      const response = await fetch("/api/admin/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: selectedLecture.id,
          title: artifactForm.title,
          description: artifactForm.description,
          type: artifactForm.type,
          category: artifactForm.category,
          sortOrder: Number.parseInt(artifactForm.sortOrder || "0", 10),
          isActive: artifactForm.isActive,
          ...(artifactForm.type === "link" ? { url: artifactForm.url } : { storagePath })
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "자료 등록에 실패했습니다.");

      setArtifacts((current) => [...current, data.artifact as Artifact].sort((a, b) => a.sort_order - b.sort_order));
      setArtifactForm(emptyArtifactForm);
      setArtifactFile(null);
      setMessage("자료를 등록했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "자료 등록에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function linkAccessCode() {
    if (!selectedLecture || !linkCodeId) {
      setMessage("강좌와 접속 코드를 선택해 주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/lecture-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId: selectedLecture.id, accessCodeId: linkCodeId, sortOrder: selectedLinks.length })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "접속 코드 연결에 실패했습니다.");

      setLectureLinks((current) => [...current.filter((link) => link.id !== data.link.id), data.link as LectureAccessLink]);
      setLinkCodeId("");
      setMessage("접속 코드를 연결했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "접속 코드 연결에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function unlinkAccessCode(accessCodeId: string) {
    if (!selectedLecture) return;

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/lecture-access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId: selectedLecture.id, accessCodeId })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "접속 코드 연결 해제에 실패했습니다.");

      setLectureLinks((current) =>
        current.filter((link) => !(link.lecture_id === selectedLecture.id && link.access_code_id === accessCodeId))
      );
      setMessage("접속 코드 연결을 해제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "접속 코드 연결 해제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedHealth = selectedLecture ? getLectureHealth(selectedLecture, selectedArtifacts, selectedCodes) : null;

  return (
    <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cool-blue">Lectures</p>
            <h2 className="mt-1 text-xl font-black text-cool-ink">강의 목록</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">강의를 먼저 선택하고 오른쪽에서 운영합니다.</p>
          </div>
          {isLoading ? <Loader2 className="animate-spin text-cool-blue" size={18} aria-hidden="true" /> : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => startNewLecture()}
            className="inline-flex items-center gap-2 rounded-md bg-cool-blue px-3 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blue-600"
          >
            <Plus size={16} aria-hidden="true" />
            새 강의
          </button>
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-white px-3 py-2 text-sm font-bold text-cool-ink transition hover:bg-cool-ice"
          >
            <RefreshCw size={16} aria-hidden="true" />
            새로고침
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="relative block" htmlFor="lecture-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
            <input
              id="lecture-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-md border border-cool-mist bg-cool-ice/60 py-2 pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-cool-blue focus:bg-white focus:ring-4 focus:ring-cool-blue/20"
              placeholder="강의명 검색"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  statusFilter === filter.value
                    ? "bg-cool-navy text-white"
                    : "border border-cool-mist bg-white text-slate-600 hover:border-cool-blue/50 hover:text-cool-blue"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid max-h-[62vh] gap-2 overflow-auto pr-1">
          {!isLoading && filteredLectures.length === 0 ? (
            <p className="rounded-md border border-dashed border-cool-mist px-3 py-5 text-sm text-slate-500">조건에 맞는 강의가 없습니다.</p>
          ) : null}
          {filteredLectures.map((lecture) => {
            const lectureArtifacts = artifacts.filter((artifact) => artifact.lecture_id === lecture.id);
            const lectureCodes = lectureLinks
              .filter((link) => link.lecture_id === lecture.id)
              .map((link) => accessCodes.find((code) => code.id === link.access_code_id))
              .filter((code): code is AccessCode => Boolean(code));
            const health = getLectureHealth(lecture, lectureArtifacts, lectureCodes);

            return (
              <button
                key={lecture.id}
                type="button"
                onClick={() => selectLecture(lecture)}
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  lecture.id === selectedLectureId
                    ? "border-cool-blue bg-cool-ice shadow-soft"
                    : "border-cool-mist bg-white hover:border-cool-blue/50 hover:bg-cool-ice/60"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-cool-ink">{lecture.title}</span>
                    {lecture.description ? <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-500">{lecture.description}</span> : null}
                  </span>
                  <HealthBadge health={health} />
                </span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  <MiniBadge>{getLectureMaterialTypeLabel(lecture.material_type ?? "html")}</MiniBadge>
                  <MiniBadge>자료 {lectureArtifacts.length}</MiniBadge>
                  <MiniBadge>{lectureCodes.length > 0 ? "코드 연결" : "코드 없음"}</MiniBadge>
                  <MiniBadge>{statusLabel(lecture.status)}</MiniBadge>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-cool-mint via-cool-aqua to-cool-blue" />
        <div className="border-b border-cool-mist p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-cool-blue">{selectedLecture ? "선택된 강의" : "새 강의 작성"}</p>
              <h2 className="mt-2 truncate text-2xl font-black text-cool-ink">
                {selectedLecture ? selectedLecture.title : "새 강의"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedLecture
                  ? `${getLectureMaterialTypeLabel(selectedLecture.material_type ?? "html")} · 학습자료 ${selectedArtifacts.length}개 · 접속 코드 ${selectedCodes.length}개`
                  : "기본 정보를 입력하고 저장하면 이어서 자료와 접속 코드를 관리할 수 있습니다."}
              </p>
              {selectedHealth ? <div className="mt-3"><HealthBadge health={selectedHealth} /></div> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLecture ? (
                <a
                  href={`/lecture/${selectedLecture.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-white px-3 py-2 text-sm font-bold text-cool-ink transition hover:border-cool-blue/50 hover:text-cool-blue"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  학습자 미리보기
                </a>
              ) : null}
              {selectedLecture ? (
                <button
                  type="button"
                  onClick={toggleSelectedLectureStatus}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-white px-3 py-2 text-sm font-bold text-cool-ink transition hover:bg-cool-ice disabled:opacity-50"
                >
                  {selectedLecture.status === "active" ? <XCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                  {selectedLecture.status === "active" ? "비공개 전환" : "공개 전환"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={saveLecture}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blue-600 disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                {selectedLecture ? "저장" : "강의 만들기"}
              </button>
            </div>
          </div>

          {message ? <p className="mt-4 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-bold text-cool-ink">{message}</p> : null}
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-cool-mist bg-cool-ice/60 px-5 py-3">
          {tabItems.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-black transition ${
                activeTab === tab.value
                  ? "bg-cool-navy text-white"
                  : "border border-cool-mist bg-white text-slate-600 hover:border-cool-blue/50 hover:text-cool-blue"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "basic" ? (
            <BasicTab form={lectureForm} updateForm={updateLectureForm} />
          ) : null}
          {activeTab === "material" ? (
            <MaterialTab
              form={lectureForm}
              materialFile={materialFile}
              displayPdfFile={displayPdfFile}
              updateForm={updateLectureForm}
              selectMaterialFile={selectMaterialFile}
              setDisplayPdfFile={setDisplayPdfFile}
            />
          ) : null}
          {activeTab === "artifacts" ? (
            <ArtifactsTab
              selectedLecture={selectedLecture}
              artifacts={selectedArtifacts}
              form={artifactForm}
              artifactFile={artifactFile}
              updateForm={updateArtifactForm}
              setArtifactFile={setArtifactFile}
              createArtifact={createArtifact}
              isSaving={isSaving}
            />
          ) : null}
          {activeTab === "codes" ? (
            <CodesTab
              selectedLecture={selectedLecture}
              accessCodes={accessCodes}
              selectedCodes={selectedCodes}
              selectedLinks={selectedLinks}
              linkCodeId={linkCodeId}
              setLinkCodeId={setLinkCodeId}
              linkAccessCode={linkAccessCode}
              unlinkAccessCode={unlinkAccessCode}
              isSaving={isSaving}
            />
          ) : null}
        </div>
      </section>
    </section>
  );
}

function BasicTab({ form, updateForm }: { form: typeof emptyLectureForm; updateForm: (field: keyof typeof emptyLectureForm, value: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="text-sm font-bold text-slate-700" htmlFor="workspace-title">
        강의명
        <input
          id="workspace-title"
          value={form.title}
          onChange={(event) => updateForm("title", event.target.value)}
          className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          placeholder="예: 25년 5월 HPMP 1차"
        />
      </label>
      <label className="text-sm font-bold text-slate-700" htmlFor="workspace-status">
        상태
        <select
          id="workspace-status"
          value={form.status}
          onChange={(event) => updateForm("status", event.target.value)}
          className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
        >
          <option value="draft">초안</option>
          <option value="active">공개</option>
          <option value="inactive">비공개</option>
        </select>
      </label>
      <label className="text-sm font-bold text-slate-700 lg:col-span-2" htmlFor="workspace-description">
        설명
        <textarea
          id="workspace-description"
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          placeholder="강의 카드와 관리자 목록에 표시할 설명"
        />
      </label>
      <label className="text-sm font-bold text-slate-700" htmlFor="workspace-sort-order">
        정렬 순서
        <input
          id="workspace-sort-order"
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(event) => updateForm("sortOrder", event.target.value)}
          className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
        />
      </label>
    </div>
  );
}

function FilePicker({
  id,
  label,
  accept,
  file,
  currentPath,
  helper,
  className = "",
  onFileChange
}: {
  id: string;
  label: string;
  accept?: string;
  file: File | null;
  currentPath?: string;
  helper?: string;
  className?: string;
  onFileChange: (file: File | null) => void;
}) {
  const displayText = file?.name ?? currentPath ?? "선택된 파일 없음";

  return (
    <div className={`text-sm font-bold text-slate-700 ${className}`}>
      <span id={`${id}-label`}>{label}</span>
      <div className="relative mt-2 flex min-h-12 items-center gap-3 rounded-md border border-cool-mist bg-white px-3 py-2 transition focus-within:border-cool-blue focus-within:ring-4 focus-within:ring-cool-blue/20">
        <input
          id={id}
          type="file"
          accept={accept}
          aria-labelledby={`${id}-label`}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-black text-cool-blue">
          <FileUp size={16} aria-hidden="true" />
          파일 선택
        </span>
        <span className="min-w-0 truncate text-sm font-bold text-cool-ink">{displayText}</span>
      </div>
      {helper ? <span className="mt-2 block text-xs font-medium text-slate-500">{helper}</span> : null}
      {currentPath ? <span className="mt-1 block truncate text-xs font-medium text-slate-500">현재 파일: {currentPath}</span> : null}
    </div>
  );
}

function MaterialTab({
  form,
  materialFile,
  displayPdfFile,
  updateForm,
  selectMaterialFile,
  setDisplayPdfFile
}: {
  form: typeof emptyLectureForm;
  materialFile: File | null;
  displayPdfFile: File | null;
  updateForm: (field: keyof typeof emptyLectureForm, value: string) => void;
  selectMaterialFile: (file: File | null) => void;
  setDisplayPdfFile: (file: File | null) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FilePicker
        id="workspace-material"
        label="강의자료"
        accept=".html,.pdf,.ppt,.pptx,text/html,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        file={materialFile}
        currentPath={form.materialStoragePath}
        onFileChange={selectMaterialFile}
      />
      <label className="text-sm font-bold text-slate-700" htmlFor="workspace-material-type">
        자료 유형
        <select
          id="workspace-material-type"
          value={form.materialType}
          onChange={(event) => updateForm("materialType", event.target.value)}
          className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
        >
          <option value="html">HTML</option>
          <option value="pdf">PDF</option>
          <option value="ppt">PPT</option>
          <option value="pptx">PPTX</option>
        </select>
      </label>
      <FilePicker
        id="workspace-display-pdf"
        label="표시용 PDF"
        accept=".pdf,application/pdf"
        file={displayPdfFile}
        currentPath={form.displayPdfStoragePath}
        onFileChange={setDisplayPdfFile}
        className="lg:col-span-2"
        helper="PPT/PPTX는 표시용 PDF가 있으면 학습자 화면에서 키보드로 페이지를 넘길 수 있습니다."
      />
    </div>
  );
}

function ArtifactsTab({
  selectedLecture,
  artifacts,
  form,
  artifactFile,
  updateForm,
  setArtifactFile,
  createArtifact,
  isSaving
}: {
  selectedLecture: Lecture | null;
  artifacts: Artifact[];
  form: typeof emptyArtifactForm;
  artifactFile: File | null;
  updateForm: (field: keyof typeof emptyArtifactForm, value: string | boolean) => void;
  setArtifactFile: (file: File | null) => void;
  createArtifact: () => void;
  isSaving: boolean;
}) {
  if (!selectedLecture) return <EmptySelection message="강의를 저장한 뒤 학습자료를 등록할 수 있습니다." />;

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-3">
        <h3 className="text-sm font-black text-cool-ink">등록된 자료</h3>
        {artifacts.length === 0 ? <p className="rounded-md border border-dashed border-cool-mist px-3 py-5 text-sm text-slate-500">아직 등록된 자료가 없습니다.</p> : null}
        {artifacts.map((artifact) => (
          <div key={artifact.id} className="rounded-md border border-cool-mist bg-white px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2 text-sm font-black text-cool-ink">
                {artifact.type === "link" ? <LinkIcon size={15} aria-hidden="true" /> : <FileUp size={15} aria-hidden="true" />}
                <span className="truncate">{artifact.title}</span>
              </span>
              <span className="text-xs font-bold text-slate-500">{categoryLabels[artifact.category]}</span>
            </div>
            {artifact.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{artifact.description}</p> : null}
            {artifact.url ? <a href={artifact.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cool-blue"><ExternalLink size={13} aria-hidden="true" />링크 열기</a> : null}
            {artifact.storage_path ? <p className="mt-2 truncate text-xs text-slate-500">{artifact.storage_path}</p> : null}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-cool-mist bg-cool-ice/50 p-4">
        <h3 className="text-sm font-black text-cool-ink">자료 추가</h3>
        <div className="mt-4 grid gap-3">
          <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-title">
            자료명
            <input id="workspace-artifact-title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="예: 실습 교안" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-type">
              유형
              <select id="workspace-artifact-type" value={form.type} onChange={(event) => updateForm("type", event.target.value as ArtifactType)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
                <option value="file">파일</option>
                <option value="link">링크</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-category">
              분류
              <select id="workspace-artifact-category" value={form.category} onChange={(event) => updateForm("category", event.target.value as ArtifactCategory)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
                <option value="practice">실습</option>
                <option value="reference">참고</option>
                <option value="external">외부</option>
                <option value="preparation">사전 준비</option>
              </select>
            </label>
          </div>
          {form.type === "link" ? (
            <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-url">
              URL
              <input id="workspace-artifact-url" value={form.url} onChange={(event) => updateForm("url", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="https://..." />
            </label>
          ) : (
            <FilePicker id="workspace-artifact-file" label="파일" file={artifactFile} onFileChange={setArtifactFile} />
          )}
          <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-description">
            설명
            <textarea id="workspace-artifact-description" value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="mt-2 min-h-20 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="자료 패널에 표시할 설명" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold text-slate-700" htmlFor="workspace-artifact-sort">
              정렬
              <input id="workspace-artifact-sort" type="number" min="0" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
            </label>
            <label className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} className="size-4 rounded border-cool-mist text-cool-blue" />
              활성화
            </label>
          </div>
          <button type="button" onClick={createArtifact} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blue-600 disabled:opacity-60">
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            자료 등록
          </button>
        </div>
      </div>
    </div>
  );
}

function CodesTab({
  selectedLecture,
  accessCodes,
  selectedCodes,
  selectedLinks,
  linkCodeId,
  setLinkCodeId,
  linkAccessCode,
  unlinkAccessCode,
  isSaving
}: {
  selectedLecture: Lecture | null;
  accessCodes: AccessCode[];
  selectedCodes: AccessCode[];
  selectedLinks: LectureAccessLink[];
  linkCodeId: string;
  setLinkCodeId: (value: string) => void;
  linkAccessCode: () => void;
  unlinkAccessCode: (accessCodeId: string) => void;
  isSaving: boolean;
}) {
  if (!selectedLecture) return <EmptySelection message="강의를 저장한 뒤 접속 코드를 연결할 수 있습니다." />;

  const linkedIds = new Set(selectedLinks.map((link) => link.access_code_id));
  const availableCodes = accessCodes.filter((code) => !linkedIds.has(code.id));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-3">
        <h3 className="text-sm font-black text-cool-ink">연결된 접속 코드</h3>
        {selectedCodes.length === 0 ? <p className="rounded-md border border-dashed border-cool-mist px-3 py-5 text-sm text-slate-500">연결된 접속 코드가 없습니다.</p> : null}
        {selectedCodes.map((code) => (
          <div key={code.id} className="rounded-md border border-cool-mist bg-white px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-cool-ink">{code.name}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(code.starts_at)} - {formatDate(code.ends_at)}</p>
              </div>
              <button type="button" onClick={() => void unlinkAccessCode(code.id)} disabled={isSaving} className="rounded-md border border-cool-mist px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50">
                해제
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-cool-mist bg-cool-ice/50 p-4">
        <h3 className="text-sm font-black text-cool-ink">코드 연결</h3>
        <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="workspace-code-link">
          접속 코드
          <select id="workspace-code-link" value={linkCodeId} onChange={(event) => setLinkCodeId(event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
            <option value="">코드 선택</option>
            {availableCodes.map((code) => (
              <option key={code.id} value={code.id}>{code.name}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={linkAccessCode} disabled={isSaving || !linkCodeId} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-blue-600 disabled:opacity-60">
          <ShieldCheck size={16} aria-hidden="true" />
          연결
        </button>
      </div>
    </div>
  );
}

function EmptySelection({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-cool-mist px-4 py-8 text-center text-sm font-semibold text-slate-500">{message}</p>;
}

function HealthBadge({ health }: { health: ReturnType<typeof getLectureHealth> }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${health.className}`}>
      {health.label}
    </span>
  );
}

function MiniBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-cool-mist bg-white px-2 py-1 text-[11px] font-bold text-slate-500">{children}</span>;
}

function getLectureHealth(lecture: Lecture, artifacts: Artifact[], codes: AccessCode[]) {
  const now = Date.now();
  const activeCodeCount = codes.filter(
    (code) => code.is_active && new Date(code.starts_at).getTime() <= now && new Date(code.ends_at).getTime() >= now
  ).length;

  if (lecture.status === "draft") return { label: "초안", className: "bg-slate-100 text-slate-600" };
  if (lecture.status === "inactive") return { label: "비공개", className: "bg-slate-100 text-slate-600" };
  if (!lecture.material_storage_path && !lecture.html_storage_path) return { label: "자료 없음", className: "bg-amber-100 text-amber-700" };
  if (codes.length === 0) return { label: "코드 미연결", className: "bg-orange-100 text-orange-700" };
  if (activeCodeCount === 0) return { label: "유효 코드 없음", className: "bg-rose-100 text-rose-700" };
  if (artifacts.filter((artifact) => artifact.is_active).length === 0) return { label: "학습자료 없음", className: "bg-sky-100 text-sky-700" };

  return { label: "공개 가능", className: "bg-emerald-100 text-emerald-700" };
}

function statusLabel(status: LectureStatus) {
  if (status === "active") return "공개";
  if (status === "inactive") return "비공개";
  return "초안";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}
