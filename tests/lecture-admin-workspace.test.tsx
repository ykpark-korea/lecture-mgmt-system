import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LectureAdminWorkspace } from "@/components/admin/LectureAdminWorkspace";

const createdLecture = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "신규 AI 강의",
  description: "",
  status: "draft",
  html_storage_path: null,
  material_type: "html",
  material_storage_path: null,
  display_pdf_storage_path: null,
  thumbnail_storage_path: null,
  uses_default_hero: true,
  published_starts_at: null,
  published_ends_at: null,
  sort_order: 0,
  created_at: "2026-05-18T00:00:00.000Z",
  updated_at: "2026-05-18T00:00:00.000Z"
};

const lectureWithMaterial = {
  ...createdLecture,
  html_storage_path: `${createdLecture.id}/lecture.html`,
  material_storage_path: `${createdLecture.id}/lecture.html`
};

const existingHtmlLecture = {
  ...createdLecture,
  id: "22222222-2222-4222-8222-222222222222",
  title: "기존 HTML 강의",
  html_storage_path: "22222222-2222-4222-8222-222222222222/lecture.html",
  material_storage_path: "22222222-2222-4222-8222-222222222222/lecture.html"
};

const existingPdfLecture = {
  ...existingHtmlLecture,
  html_storage_path: null,
  material_type: "pdf",
  material_storage_path: "22222222-2222-4222-8222-222222222222/2.pdf"
};

const practiceArtifact = {
  id: "33333333-3333-4333-8333-333333333333",
  lecture_id: existingHtmlLecture.id,
  type: "file",
  category: "practice",
  title: "실습 교안",
  description: "",
  url: null,
  storage_path: `${existingHtmlLecture.id}/guide.pdf`,
  is_active: true,
  sort_order: 0,
  created_at: "2026-05-18T00:00:00.000Z",
  updated_at: "2026-05-18T00:00:00.000Z"
};

function mockWorkspaceLoadWithArtifact() {
  return vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ lectures: [existingHtmlLecture] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ artifacts: [practiceArtifact] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ codes: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ links: [] }) });
}

describe("LectureAdminWorkspace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a new lecture before uploading its lecture material so the saved lecture id owns the file", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lectures: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ artifacts: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codes: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ links: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lecture: createdLecture }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          path: `${createdLecture.id}/lecture.html`,
          upload: {
            signedUrl: "https://upload.example.com",
            contentType: "text/html"
          }
        })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lecture: lectureWithMaterial }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.change(await screen.findByLabelText("강의명"), { target: { value: "신규 AI 강의" } });
    fireEvent.click(screen.getByRole("button", { name: "강의자료" }));
    fireEvent.change(screen.getByLabelText("강의자료"), {
      target: {
        files: [new File(["<html></html>"], "lecture.html", { type: "text/html" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "강의 만들기" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(fetchMock.mock.calls[4][0]).toBe("/api/admin/lectures");
    expect(fetchMock.mock.calls[4][1]).toMatchObject({ method: "POST" });
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).not.toHaveProperty("materialStoragePath");
    expect(JSON.parse(fetchMock.mock.calls[5][1].body)).toMatchObject({
      bucket: "lecture-html",
      ownerId: createdLecture.id,
      fileName: "lecture.html",
      contentType: "text/html"
    });
    expect(fetchMock.mock.calls[7][0]).toBe("/api/admin/lectures");
    expect(fetchMock.mock.calls[7][1]).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(fetchMock.mock.calls[7][1].body)).toMatchObject({
      id: createdLecture.id,
      materialType: "html",
      materialStoragePath: `${createdLecture.id}/lecture.html`,
      htmlStoragePath: `${createdLecture.id}/lecture.html`
    });
  });

  it("does not send an existing html material path while replacing a selected lecture with a pdf", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lectures: [existingHtmlLecture] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ artifacts: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codes: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ links: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lecture: existingHtmlLecture }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          path: `${existingHtmlLecture.id}/2.pdf`,
          upload: {
            signedUrl: "https://upload.example.com",
            contentType: "application/pdf"
          }
        })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ lecture: existingPdfLecture }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "강의자료" }));
    fireEvent.change(screen.getByLabelText("강의자료"), {
      target: {
        files: [new File(["pdf"], "2교시_강의안.pdf", { type: "application/pdf" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(fetchMock.mock.calls[4][0]).toBe("/api/admin/lectures");
    expect(fetchMock.mock.calls[4][1]).toMatchObject({ method: "PATCH" });
    const initialPatchBody = JSON.parse(fetchMock.mock.calls[4][1].body);
    expect(initialPatchBody).toMatchObject({
      id: existingHtmlLecture.id,
      materialType: "pdf"
    });
    expect(initialPatchBody).not.toHaveProperty("materialStoragePath");
    expect(initialPatchBody).not.toHaveProperty("htmlStoragePath");
    expect(JSON.parse(fetchMock.mock.calls[7][1].body)).toMatchObject({
      id: existingHtmlLecture.id,
      materialType: "pdf",
      materialStoragePath: `${existingHtmlLecture.id}/2.pdf`
    });
  });

  it("deletes a learning material after the admin confirms and removes it from the list", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = mockWorkspaceLoadWithArtifact().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, storageRemoved: true })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "학습자료" }));
    fireEvent.click(screen.getByRole("button", { name: "실습 교안 삭제" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[4][0]).toBe("/api/admin/artifacts");
    expect(fetchMock.mock.calls[4][1]).toMatchObject({ method: "DELETE" });
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).toEqual({ id: practiceArtifact.id });
    await waitFor(() => expect(screen.queryByText("실습 교안")).not.toBeInTheDocument());
  });

  it("does not delete a learning material when the admin cancels the confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = mockWorkspaceLoadWithArtifact();
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "학습자료" }));
    fireEvent.click(screen.getByRole("button", { name: "실습 교안 삭제" }));

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(screen.getByText("실습 교안")).toBeInTheDocument();
  });

  it("keeps the learning material and shows the server error when deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = mockWorkspaceLoadWithArtifact().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "삭제 서버 오류" })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "학습자료" }));
    fireEvent.click(screen.getByRole("button", { name: "실습 교안 삭제" }));

    expect(await screen.findByText("삭제 서버 오류")).toBeInTheDocument();
    expect(screen.getByText("실습 교안")).toBeInTheDocument();
  });

  it("drops a learning material that was already deleted elsewhere instead of keeping a stale row", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = mockWorkspaceLoadWithArtifact().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Artifact not found" })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "학습자료" }));
    fireEvent.click(screen.getByRole("button", { name: "실습 교안 삭제" }));

    expect(await screen.findByText("이미 삭제된 학습자료입니다.")).toBeInTheDocument();
    expect(screen.queryByText("실습 교안")).not.toBeInTheDocument();
  });

  it("warns that the stored file may remain when only the database row was deleted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = mockWorkspaceLoadWithArtifact().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, storageRemoved: false })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureAdminWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "학습자료" }));
    fireEvent.click(screen.getByRole("button", { name: "실습 교안 삭제" }));

    expect(await screen.findByText(/저장소 파일은 남아 있을 수 있습니다/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("실습 교안")).not.toBeInTheDocument());
  });
});
