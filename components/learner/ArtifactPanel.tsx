import { Download, ExternalLink, FileText } from "lucide-react";
import type { Artifact, ArtifactCategory } from "@/src/types/database";
import { isHttpUrl } from "@/src/lib/validation";

type ArtifactPanelProps = {
  artifacts: Artifact[];
};

const categoryLabels: Record<ArtifactCategory, string> = {
  practice: "실습 자료",
  reference: "참고 자료",
  external: "외부 링크",
  preparation: "사전 준비"
};

const categoryOrder: ArtifactCategory[] = ["practice", "reference", "external", "preparation"];

export default function ArtifactPanel({ artifacts }: ArtifactPanelProps) {
  const groupedArtifacts = categoryOrder
    .map((category) => ({
      category,
      items: artifacts.filter((artifact) => artifact.category === category)
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="rounded-lg border border-cool-mist bg-white/95 p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-sm font-semibold text-hanwha-orange">학습 자료</p>
        <h2 className="mt-1 text-xl font-bold tracking-normal text-cool-ink">자료실</h2>
      </div>

      {groupedArtifacts.length === 0 ? (
        <div className="rounded-md border border-dashed border-cool-mist bg-cool-ice p-5 text-sm leading-6 text-slate-600">
          현재 등록된 학습 자료가 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedArtifacts.map((group) => (
            <section key={group.category}>
              <h3 className="text-sm font-bold text-cool-ink">{categoryLabels[group.category]}</h3>
              <div className="mt-3 space-y-3">
                {group.items.map((artifact) => (
                  <ArtifactLink key={artifact.id} artifact={artifact} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </aside>
  );
}

function ArtifactLink({ artifact }: { artifact: Artifact }) {
  const isFile = artifact.type === "file";
  const isSafeExternalLink = !isFile && isHttpUrl(artifact.url);
  const href = isFile ? `/api/artifacts/${artifact.id}/signed-url` : artifact.url ?? undefined;
  const Icon = isFile ? Download : ExternalLink;
  const content = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-cool-blue">
        {isFile ? <FileText aria-hidden="true" size={17} /> : <Icon aria-hidden="true" size={17} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-cool-ink group-hover:text-cool-blue">
          {artifact.title}
        </span>
        {artifact.description ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500">{artifact.description}</span>
        ) : null}
      </span>
      {isFile ? (
        <Download aria-hidden="true" className="mt-1 shrink-0 text-slate-400" size={16} />
      ) : (
        <ExternalLink aria-hidden="true" className="mt-1 shrink-0 text-slate-400" size={16} />
      )}
    </>
  );

  if (!isFile && !isSafeExternalLink) {
    return (
      <div className="group flex items-start gap-3 rounded-md border border-cool-mist bg-cool-ice px-4 py-3 text-sm text-slate-500">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      download={isFile ? "" : undefined}
      target={isFile ? undefined : "_blank"}
      rel={isFile ? undefined : "noreferrer"}
      className="group flex items-start gap-3 rounded-md border border-cool-mist bg-cool-ice px-4 py-3 text-sm transition hover:border-cool-blue/50 hover:bg-white"
    >
      {content}
    </a>
  );
}
