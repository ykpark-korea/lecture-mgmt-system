import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import LectureWorkspace from "@/components/learner/LectureWorkspace";

describe("LectureWorkspace", () => {
  it("collapses and expands the learning materials panel", () => {
    render(<LectureWorkspace lectureId="lecture-1" title="HPMP" artifacts={[]} />);

    expect(screen.getByText("자료실")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("학습자료 접기"));
    expect(screen.getByTitle("학습자료 펼치기")).toBeInTheDocument();
    expect(screen.getByText("학습자료")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("학습자료 펼치기"));
    expect(screen.getByText("자료실")).toBeInTheDocument();
  });
});
