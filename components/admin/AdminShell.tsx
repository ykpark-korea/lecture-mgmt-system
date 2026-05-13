import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/src/lib/cookies";

const navItems = [
  { href: "/admin", label: "운영 현황" },
  { href: "/admin/lectures", label: "강의 관리" },
  { href: "/admin/codes", label: "접속 코드" },
  { href: "/admin/settings", label: "설정" }
];

export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await readAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-cool-ice text-cool-ink">
      <header className="border-b border-cool-mist bg-white/92 px-5 py-4 shadow-sm backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-lg font-bold tracking-normal text-cool-ink" href="/admin">
            한화손보 강의 관리자
          </Link>
          <nav aria-label="관리자 메뉴" className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-cool-mist bg-cool-ice px-3 py-2 text-slate-700 transition hover:border-cool-blue/50 hover:bg-white hover:text-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
              >
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
