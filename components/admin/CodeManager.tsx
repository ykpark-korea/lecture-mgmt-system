"use client";

import { useEffect, useState } from "react";
import { Link2, Loader2, Plus, RefreshCw, Save } from "lucide-react";

type AccessCode = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Lecture = {
  id: string;
  title: string;
  status: string;
  sort_order: number;
};

type LectureAccessLink = {
  id: string;
  lecture_id: string;
  access_code_id: string;
  sort_order: number;
};

const nowLocal = () => toDateTimeLocal(new Date());
const nextMonthLocal = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateTimeLocal(date);
};

const emptyForm = {
  name: "",
  code: "",
  startsAt: nowLocal(),
  endsAt: nextMonthLocal(),
  notes: "",
  isActive: true,
  lectureId: "",
  sortOrder: "0"
};

export function CodeManager() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [links, setLinks] = useState<LectureAccessLink[]>([]);
  const [selectedCodeId, setSelectedCodeId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setIsLoading(true);
    setMessage("");

    try {
      const [codesResponse, lecturesResponse, linksResponse] = await Promise.all([
        fetch("/api/admin/codes"),
        fetch("/api/admin/lectures"),
        fetch("/api/admin/lecture-access")
      ]);
      const [codesData, lecturesData, linksData] = await Promise.all([
        codesResponse.json(),
        lecturesResponse.json(),
        linksResponse.json()
      ]);

      if (!codesResponse.ok) throw new Error(codesData.error ?? "접속 코드 목록을 불러오지 못했습니다.");
      if (!lecturesResponse.ok) throw new Error(lecturesData.error ?? "강좌 목록을 불러오지 못했습니다.");
      if (!linksResponse.ok) throw new Error(linksData.error ?? "강좌 연결 목록을 불러오지 못했습니다.");

      setCodes(codesData.codes ?? []);
      setLectures(lecturesData.lectures ?? []);
      setLinks(linksData.links ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "접속 코드 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setSelectedCodeId("");
    setForm({ ...emptyForm, startsAt: nowLocal(), endsAt: nextMonthLocal() });
    setMessage("");
  }

  function selectCode(code: AccessCode) {
    const link = links.find((item) => item.access_code_id === code.id);
    setSelectedCodeId(code.id);
    setForm({
      name: code.name,
      code: "",
      startsAt: toDateTimeLocal(new Date(code.starts_at)),
      endsAt: toDateTimeLocal(new Date(code.ends_at)),
      notes: code.notes ?? "",
      isActive: code.is_active,
      lectureId: link?.lecture_id ?? "",
      sortOrder: String(link?.sort_order ?? 0)
    });
    setMessage("");
  }

  async function createCode() {
    if (!form.name.trim() || !form.code.trim()) {
      setMessage("코드명과 코드를 입력해 주세요.");
      return;
    }

    await saveCode("create");
  }

  async function updateCode() {
    if (!selectedCodeId) {
      setMessage("수정할 접속 코드를 먼저 선택해 주세요.");
      return;
    }

    await saveCode("update");
  }

  async function saveCode(mode: "create" | "update") {
    setIsSaving(true);
    setMessage("");

    try {
      const body = {
        ...(mode === "update" ? { id: selectedCodeId } : { code: form.code }),
        name: form.name,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        isActive: form.isActive,
        notes: form.notes
      };
      const response = await fetch("/api/admin/codes", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "접속 코드 저장에 실패했습니다.");
      }

      const savedCode = data.code as AccessCode;
      setCodes((current) =>
        mode === "create" ? [savedCode, ...current] : current.map((code) => (code.id === savedCode.id ? savedCode : code))
      );
      setSelectedCodeId(savedCode.id);

      if (form.lectureId) {
        await linkCodeToLecture(savedCode.id);
      }

      setForm((current) => ({ ...current, code: "" }));
      setMessage(mode === "create" ? "접속 코드를 만들었습니다." : "접속 코드를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "접속 코드 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function linkCodeToLecture(accessCodeId = selectedCodeId) {
    if (!form.lectureId || !accessCodeId) {
      setMessage("연결할 강좌와 접속 코드를 선택해 주세요.");
      return;
    }

    const response = await fetch("/api/admin/lecture-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lectureId: form.lectureId,
        accessCodeId,
        sortOrder: Number.parseInt(form.sortOrder || "0", 10)
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "강좌 연결에 실패했습니다.");
    }

    const savedLink = data.link as LectureAccessLink;
    setLinks((current) => [
      ...current.filter((link) => !(link.lecture_id === savedLink.lecture_id && link.access_code_id === savedLink.access_code_id)),
      savedLink
    ]);
  }

  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cool-blue">Access Codes</p>
          <h2 className="mt-2 text-xl font-bold text-cool-ink">접속 코드 발급</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">수강 기간과 연결 강좌를 지정합니다.</p>
        </div>
        {isLoading ? <Loader2 size={18} className="animate-spin text-cool-blue" aria-hidden="true" /> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-3 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice">
          <Plus size={16} aria-hidden="true" />
          새 입력
        </button>
        <button type="button" onClick={loadAll} className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-3 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice">
          <RefreshCw size={16} aria-hidden="true" />
          새로고침
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="접속 코드 생성 입력" role="group">
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-name">
          코드명
          <input id="code-name" name="name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="예: 5월 모집인 과정" />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-value">
          코드
          <input id="code-value" name="code" value={form.code} onChange={(event) => updateForm("code", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder={selectedCodeId ? "기존 코드는 표시되지 않습니다" : "HANWHA-2026"} />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-starts-at">
          시작 일시
          <input id="code-starts-at" name="startsAt" type="datetime-local" value={form.startsAt} onChange={(event) => updateForm("startsAt", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-ends-at">
          종료 일시
          <input id="code-ends-at" name="endsAt" type="datetime-local" value={form.endsAt} onChange={(event) => updateForm("endsAt", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-lecture-id">
          연결 강좌
          <select id="code-lecture-id" value={form.lectureId} onChange={(event) => updateForm("lectureId", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20">
            <option value="">선택 안 함</option>
            {lectures.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>{lecture.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="code-sort-order">
          연결 정렬
          <input id="code-sort-order" type="number" min="0" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="code-notes">
          메모
          <textarea id="code-notes" name="notes" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} className="mt-2 min-h-20 w-full rounded-md border border-cool-mist px-3 py-2 text-sm focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20" placeholder="운영자가 확인할 내부 메모" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} className="size-4 rounded border-cool-mist text-cool-blue" />
          활성화
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="button" onClick={createCode} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-cool-blue px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            접속 코드 만들기
          </button>
          <button type="button" onClick={updateCode} disabled={isSaving || !selectedCodeId} className="inline-flex items-center gap-2 rounded-md border border-cool-mist px-4 py-2 text-sm font-semibold text-cool-ink transition hover:bg-cool-ice disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={16} aria-hidden="true" />
            선택 코드 저장
          </button>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-sm font-semibold text-cool-ink">{message}</p> : null}

      <div className="mt-6 border-t border-cool-mist pt-5">
        <h3 className="text-sm font-bold text-cool-ink">등록된 접속 코드</h3>
        <div className="mt-3 grid gap-2">
          {!isLoading && codes.length === 0 ? <p className="rounded-md border border-dashed border-cool-mist px-3 py-4 text-sm text-slate-500">아직 등록된 접속 코드가 없습니다.</p> : null}
          {codes.map((code) => {
            const linkedLecture = lectures.find((lecture) => lecture.id === links.find((link) => link.access_code_id === code.id)?.lecture_id);
            return (
              <button key={code.id} type="button" onClick={() => selectCode(code)} className={`rounded-md border px-3 py-3 text-left transition ${code.id === selectedCodeId ? "border-cool-blue bg-cool-ice" : "border-cool-mist bg-white hover:bg-cool-ice"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-cool-ink">{code.name}</span>
                  <span className="text-xs font-semibold text-slate-500">{code.is_active ? "active" : "inactive"}</span>
                </span>
                {linkedLecture ? <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500"><Link2 size={13} aria-hidden="true" />{linkedLecture.title}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
