import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtifactEditor } from "@/components/admin/ArtifactEditor";
import { CodeManager } from "@/components/admin/CodeManager";

const lecture = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "AI 강의",
  description: "",
  status: "active",
  html_storage_path: null,
  thumbnail_storage_path: null,
  uses_default_hero: true,
  published_starts_at: null,
  published_ends_at: null,
  sort_order: 0,
  created_at: "2026-05-13T00:00:00.000Z",
  updated_at: "2026-05-13T00:00:00.000Z"
};

describe("admin editors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an access code and links it to a lecture", async () => {
    const code = {
      id: "22222222-2222-4222-8222-222222222222",
      name: "5월 공통 코드",
      starts_at: "2026-05-13T00:00:00.000Z",
      ends_at: "2026-06-13T00:00:00.000Z",
      is_active: true,
      notes: "",
      created_at: "2026-05-13T00:00:00.000Z",
      updated_at: "2026-05-13T00:00:00.000Z"
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codes: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lectures: [lecture] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ links: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ code }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ link: { id: "link-1" } }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<CodeManager />);

    fireEvent.change(await screen.findByLabelText("코드명"), { target: { value: "5월 공통 코드" } });
    fireEvent.change(screen.getByLabelText("코드"), { target: { value: "MAY-AI" } });
    fireEvent.change(screen.getByLabelText("시작 일시"), { target: { value: "2026-05-13T09:00" } });
    fireEvent.change(screen.getByLabelText("종료 일시"), { target: { value: "2026-06-13T18:00" } });
    fireEvent.change(screen.getByLabelText("연결 강좌"), { target: { value: lecture.id } });
    fireEvent.click(screen.getByRole("button", { name: "접속 코드 만들기" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/codes", expect.objectContaining({ method: "POST" })));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/lecture-access", expect.objectContaining({ method: "POST" })));
  });

  it("creates a link artifact for a lecture", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lectures: [lecture] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ artifacts: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ artifact: { id: "artifact-1", title: "참고 링크" } }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<ArtifactEditor />);

    fireEvent.change(await screen.findByLabelText("강좌"), { target: { value: lecture.id } });
    fireEvent.change(screen.getByLabelText("자료명"), { target: { value: "참고 링크" } });
    fireEvent.change(screen.getByLabelText("유형"), { target: { value: "link" } });
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "자료 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/artifacts", expect.objectContaining({
      method: "POST"
    })));
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
      lectureId: lecture.id,
      title: "참고 링크",
      type: "link",
      url: "https://example.com"
    });
  });
});
