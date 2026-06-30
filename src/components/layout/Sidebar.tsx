import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Mail, LogOut, HelpCircle, User, ChevronUp } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Group navigation items:
  // For Admin: "Main Menu" (Overview, Senders), "Outreach Management" (CSV Manager, Email Logs), "System Settings" (SMTP Settings)
  // For Sender: "Main Menu" (Assigned CSVs), "Campaigns" (Compose & Send)
  const mainMenu = items.filter((item) => 
    item.label === "Overview" || item.label === "Senders" || item.label === "Assigned CSVs"
  );
  
  const managementMenu = items.filter((item) => 
    item.label === "CSV Manager" || item.label === "Email Logs" || item.label === "Compose & Send"
  );
  
  const settingsMenu = items.filter((item) => 
    item.label === "SMTP Settings"
  );

  const renderLink = (item: NavItem) => {
    const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to + "/"));
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 select-none",
          active
            ? "bg-gray-100/80 text-gray-900 shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
        )}
      >
        {/* Active blue indicator bar on the left */}
        {active && <span className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-md bg-indigo-600" />}

        <item.icon
          className={cn(
            "h-4 w-4 transition-colors duration-200 shrink-0",
            active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-700",
          )}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white text-gray-800 relative z-20 shadow-sm select-none h-screen justify-between">
      <div>
        {/* Brand header */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-gray-100 bg-white">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Mail className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black tracking-tight text-gray-900">
              AutoMailer Pro
            </span>
            <span className="text-[9px] uppercase tracking-widest text-indigo-500 font-extrabold">
              {title} Suite
            </span>
          </div>
        </div>

        {/* Navigation sections */}
        <nav className="p-3.5 space-y-4 overflow-y-auto">
          {/* Main Menu Section */}
          {mainMenu.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 px-3 block">
                Main Menu
              </span>
              <div className="space-y-1">
                {mainMenu.map(renderLink)}
              </div>
            </div>
          )}

          {/* Outreach/Management Section */}
          {managementMenu.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 px-3 block">
                {title === "Admin" ? "Outreach Management" : "Campaigns"}
              </span>
              <div className="space-y-1">
                {managementMenu.map(renderLink)}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {settingsMenu.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 px-3 block">
                System Settings
              </span>
              <div className="space-y-1">
                {settingsMenu.map(renderLink)}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Profile & Status Footer widget */}
      <div className="p-3.5 border-t border-gray-100 bg-white space-y-3">
        {/* Support Link */}
        <div className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-gray-400" />
            <span>Support</span>
          </a>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8.5 w-8.5 rounded-full flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold text-xs shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-bold text-gray-800 truncate">{user.name}</span>
                <span className="text-[9px] text-gray-400 truncate capitalize font-semibold mt-0.5">
                  {user.role} Member
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
