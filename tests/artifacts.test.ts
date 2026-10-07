import { beforeEach, describe, expect, it, vi } from "vitest";
import { getArtifactDownloadName, listActiveArtifactsForLecture } from "@/src/lib/artifacts";

const order = vi.fn();
const eq = vi.fn();
const query: Record<string, unknown> = {};

vi.mock("@/src/lib/supabase", () => ({
  createSupabaseServiceClient: () => ({ from: () => query })
}));

describe("getArtifactDownloadName", () => {
  it.each([
    {
      name: "uses the original file name saved at upload time",
      artifact: { file_name: "AX 실습 따라하기.html", title: "실습", storage_path: "lec/ax-b190e66a.html" },
      expected: "AX 실습 따라하기.html"
    },
    {
      name: "falls back to title plus the stored extension for materials uploaded before file names were saved",
      artifact: { file_name: null, title: "AX_실습_따라하기", storage_path: "lec/ax-b190e66a.html" },
      expected: "AX_실습_따라하기.html"
    },
    {
      name: "does not double the extension when the title already ends with it",
      artifact: { file_name: null, title: "report.PDF", storage_path: "lec/file-1x.pdf" },
      expected: "report.PDF"
    },
    {
      name: "treats a blank saved file name as missing",
      artifact: { file_name: "   ", title: "지점별 실적", storage_path: "lec/file-13xgvjm.xlsx" },
      expected: "지점별 실적.xlsx"
    },
    {
      name: "replaces path separators in the title so the download name stays a single file name",
      artifact: { file_name: null, title: "1/2 교시\\실습", storage_path: "lec/2-0b025872.zip" },
      expected: "1_2 교시_실습.zip"
    },
    {
      name: "replaces path separators and control characters in a saved file name",
      artifact: { file_name: "a/b\nc.zip", title: "x", storage_path: "lec/a.zip" },
      expected: "a_b_c.zip"
    },
    {
      name: "uses the bare title when the stored path has no extension",
      artifact: { file_name: null, title: "자료", storage_path: "lec/file-abc" },
      expected: "자료"
    },
    {
      name: "uses the title when there is no stored file",
      artifact: { file_name: null, title: "외부 링크", storage_path: null },
      expected: "외부 링크"
    }
  ])("$name", ({ artifact, expected }) => {
    expect(getArtifactDownloadName(artifact)).toBe(expected);
  });
});

describe("listActiveArtifactsForLecture", () => {
  beforeEach(() => {
    order.mockReset();
    eq.mockReset();
    query.select = () => query;
    query.eq = (...args: unknown[]) => {
      eq(...args);
      return query;
    };
    query.order = (...args: unknown[]) => {
      order(...args);
      return query;
    };
    query.then = (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null });
  });

  it("orders by sort_order and breaks ties by creation time so equal sort values keep a stable order", async () => {
    await listActiveArtifactsForLecture("lecture-1");

    expect(order.mock.calls).toEqual([
      ["sort_order", { ascending: true }],
      ["created_at", { ascending: true }]
    ]);
  });

  it("only lists active artifacts of the requested lecture", async () => {
    await listActiveArtifactsForLecture("lecture-1");

    expect(eq.mock.calls).toEqual([
      ["lecture_id", "lecture-1"],
      ["is_active", true]
    ]);
  });
});
