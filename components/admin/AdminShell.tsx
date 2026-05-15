import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BarChart3, BookOpenCheck, KeyRound, Settings, ShieldCheck } from "lucide-react";
import { requireActiveAdminSession } from "@/src/lib/admin";

const navItems = [
  { href: "/admin", label: "운영 현황", icon: BarChart3 },
  { href: "/admin/lectures", label: "강의 관리", icon: BookOpenCheck },
  { href: "/admin/codes", label: "접속 코드", icon: KeyRound },
  { href: "/admin/audit", label: "접속 로그", icon: Activity },
  { href: "/admin/settings", label: "설정", icon: Settings }
];

export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await requireActiveAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen text-cool-ink">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/82 px-5 py-4 shadow-sm backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="inline-flex items-center gap-3 text-lg font-black tracking-normal text-cool-ink" href="/admin">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cool-navy text-white shadow-float">
              <ShieldCheck aria-hidden="true" size={20} />
            </span>
            <span>
              한화손보 강의 관리자
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cool-blue">Learning Ops</span>
            </span>
          </Link>
          <nav aria-label="관리자 메뉴" className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md border border-cool-mist bg-cool-ice/80 px-3 py-2 text-slate-700 transition hover:border-cool-blue/50 hover:bg-white hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
              >
                <item.icon aria-hidden="true" size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">{children}</div>
    </main>
  );
}
