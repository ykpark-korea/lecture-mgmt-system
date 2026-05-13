import type { ReactNode } from "react";

type HeroBannerProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export default function HeroBanner({
  title = "나의 강의실",
  description = "한화 교육 여정을 한곳에서 확인하고, 지금 필요한 강의와 자료로 바로 이동하세요.",
  actions
}: HeroBannerProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-cool-mist bg-white/86 shadow-soft">
      <div className="relative px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(141,223,210,0.48),transparent_34%),linear-gradient(135deg,rgba(79,143,207,0.18),transparent_58%)] lg:block" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold text-hanwha-orange">Hanwha Lecture Portal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-cool-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
