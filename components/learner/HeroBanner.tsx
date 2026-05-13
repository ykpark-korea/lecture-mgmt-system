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
    <section className="overflow-hidden rounded-lg border border-white/80 bg-white/82 shadow-glass ring-1 ring-cool-mist/70 backdrop-blur-xl">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="relative px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(223,245,255,0.95),rgba(255,255,255,0.44)_58%,rgba(141,223,210,0.22))]" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-bold text-cool-blue">Hanwha Lecture Portal</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-cool-ink sm:text-4xl">
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
        <div className="relative flex min-h-44 items-center justify-center border-t border-cool-mist/70 bg-white sm:min-h-56 lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/hero-wide.png"
            alt="한화손보 사내강의 배너"
            fill
            priority
            sizes="(min-width: 1024px) 38rem, 100vw"
            className="object-contain p-3"
          />
        </div>
      </div>
    </section>
  );
}
