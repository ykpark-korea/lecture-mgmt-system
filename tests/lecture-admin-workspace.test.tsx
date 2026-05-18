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
});
