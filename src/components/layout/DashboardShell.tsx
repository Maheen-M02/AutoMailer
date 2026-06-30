import type { ReactNode } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({
  nav,
  navTitle,
  title,
  subtitle,
  children,
}: {
  nav: NavItem[];
  navTitle: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f6fa] text-gray-900 relative">
      <Sidebar items={nav} title={navTitle} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6 relative z-10 bg-[#f4f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}
