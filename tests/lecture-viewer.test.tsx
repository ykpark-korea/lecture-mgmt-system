import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import LectureViewer from "@/components/learner/LectureViewer";

describe("LectureViewer", () => {
  it("renders the embedded lecture with a new-tab control", () => {
    render(<LectureViewer lectureId="lecture-1" title="HPMP" materialType="html" hasDisplayPdf={false} />);

    expect(screen.getByText("강의 자료")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "전체 보기" })).not.toBeInTheDocument();
    expect(screen.getByTitle("새 탭에서 열기")).toHaveAttribute("href", "/api/lectures/lecture-1/signed-url");
  });
});
