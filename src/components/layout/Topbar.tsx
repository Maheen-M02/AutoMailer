import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell, Search } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  // Extract first name for the greeting
  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  // Format date: e.g., "It's Monday, 19th May 2025"
  const getFormattedDate = () => {
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const dayName = days[today.getDay()];
    const dateNum = today.getDate();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    
    const monthName = months[today.getMonth()];
    const yearNum = today.getFullYear();
    
    return `It's ${dayName}, ${dateNum}${getOrdinal(dateNum)} ${monthName} ${yearNum}`;
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 z-20 relative select-none shrink-0 shadow-sm">
      {/* Left: Personalized Greeting */}
      <div className="space-y-0.5 leading-none">
        <h1 className="text-sm font-black tracking-tight text-gray-950 flex items-center gap-1">
          👋 Good Morning, {firstName}
        </h1>
        <p className="text-[10px] font-bold text-gray-400">
          {getFormattedDate()}
        </p>
      </div>

      {/* Center: Search pill */}
      <div className="hidden md:flex relative max-w-sm w-full mx-6">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Time to search... ⌘K"
          className="w-full h-10 pl-10 pr-12 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-[#fbfbfe] text-xs font-semibold text-gray-700 outline-none transition-all cursor-not-allowed"
          disabled
        />
        <div className="absolute right-3 top-2.5 px-1.5 py-0.5 border border-gray-200/80 bg-gray-100 rounded text-[9px] font-bold text-gray-400 font-mono shadow-sm">
          ⌘K
        </div>
      </div>

      {/* Right: Notifications & Theme settings */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon Button */}
        <button
          type="button"
          className="relative p-2 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:text-gray-900 text-gray-500 transition-all duration-200 cursor-pointer shadow-sm"
          onClick={() => alert("Notification panel coming soon!")}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-8.5 w-8.5 rounded-xl text-gray-500 hover:text-gray-900 border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all duration-200 shadow-sm shrink-0"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
