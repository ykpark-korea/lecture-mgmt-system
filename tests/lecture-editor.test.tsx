import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LectureEditor } from "@/components/admin/LectureEditor";

describe("LectureEditor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a lecture from the admin form", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lectures: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          lecture: {
            id: "lecture-1",
            title: "AI 실습 과정",
            description: "실습용 강좌",
            status: "draft",
            html_storage_path: null,
            thumbnail_storage_path: null,
            uses_default_hero: true,
            published_starts_at: null,
            published_ends_at: null,
            sort_order: 0,
            created_at: "2026-05-13T00:00:00.000Z",
            updated_at: "2026-05-13T00:00:00.000Z"
          }
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<LectureEditor />);

    fireEvent.change(screen.getByLabelText("강의명"), { target: { value: "AI 실습 과정" } });
    fireEvent.change(screen.getByLabelText("설명"), { target: { value: "실습용 강좌" } });
    fireEvent.click(screen.getByRole("button", { name: "새 강좌 만들기" }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/lectures", expect.objectContaining({
      method: "POST"
    })));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      title: "AI 실습 과정",
      description: "실습용 강좌",
      status: "draft",
      sortOrder: 0
    });
    expect(await screen.findByText("AI 실습 과정")).toBeInTheDocument();
  });
});
