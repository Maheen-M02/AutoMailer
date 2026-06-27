import { Link, useRouterState } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar backdrop-blur-xl text-sidebar-foreground relative z-20">
      {/* Brand header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-indigo-500/20">
          <Mail className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            AutoMailer
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {title}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active =
            pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to + "/"));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              {active && <span className="active-capsule" />}

              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  active
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-sidebar-foreground",
                )}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-subtle-pulse" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider">
            System Online
          </span>
        </div>
      </div>
    </aside>
  );
}
