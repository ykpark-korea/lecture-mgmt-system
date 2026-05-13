"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import ArtifactPanel from "@/components/learner/ArtifactPanel";
import LectureViewer from "@/components/learner/LectureViewer";
import type { Artifact } from "@/src/types/database";

type LectureWorkspaceProps = {
  lectureId: string;
  title: string;
  artifacts: Artifact[];
};

export default function LectureWorkspace({ lectureId, title, artifacts }: LectureWorkspaceProps) {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  return (
    <div
      className={
        isPanelCollapsed
          ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_4rem]"
          : "grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]"
      }
    >
      <LectureViewer lectureId={lectureId} title={title} />
      <ArtifactPanel
        artifacts={artifacts}
        isCollapsed={isPanelCollapsed}
        onToggle={() => setIsPanelCollapsed((current) => !current)}
      />
      <button
        type="button"
        onClick={() => setIsPanelCollapsed((current) => !current)}
        className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-cool-mist bg-white px-4 py-3 text-sm font-bold text-cool-ink shadow-glass transition hover:border-cool-blue/50 hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20 xl:hidden"
      >
        {isPanelCollapsed ? <PanelRightOpen aria-hidden="true" size={18} /> : <PanelRightClose aria-hidden="true" size={18} />}
        {isPanelCollapsed ? "자료 열기" : "자료 접기"}
      </button>
    </div>
  );
}
