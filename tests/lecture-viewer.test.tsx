import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import LectureViewer from "@/components/learner/LectureViewer";

describe("LectureViewer", () => {
  it("renders a fullscreen control for the embedded lecture", () => {
    render(<LectureViewer lectureId="lecture-1" title="HPMP" />);

    expect(screen.getByText("강의 자료")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체 보기" })).toBeInTheDocument();
    expect(screen.getByTitle("새 탭에서 열기")).toHaveAttribute("href", "/api/lectures/lecture-1/signed-url");
  });

  it("uses the browser fullscreen API when available", async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen
    });

    render(<LectureViewer lectureId="lecture-1" title="HPMP" />);
    fireEvent.click(screen.getByRole("button", { name: "전체 보기" }));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });
});
