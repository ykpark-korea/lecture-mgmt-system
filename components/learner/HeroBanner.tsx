import type { ReactNode } from "react";
import Image from "next/image";

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
    <section className="overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-soft ring-1 ring-cool-mist/70 backdrop-blur">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="relative px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(232,247,252,0.82),rgba(255,255,255,0.34)_54%,rgba(141,223,210,0.18))]" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold text-cool-blue">Hanwha Lecture Portal</p>
            <h1 className="mt-3 text-2xl font-bold tracking-normal text-cool-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
            {actions ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
        </div>
        <div className="relative min-h-40 border-t border-cool-mist/70 bg-cool-ice sm:min-h-48 lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/hero-wide.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 38rem, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/68 via-white/10 to-transparent lg:from-white/35" />
        </div>
      </div>
    </section>
  );
}
