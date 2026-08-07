import { prisma } from "@/lib/prisma";
import { Bell, Search } from "lucide-react";
import { auth } from "@/auth";



export default async function Header({ user }: { user: any }) {
  const unreadCount = user?.id ? await prisma.notification.count({
    where: { userId: user.id, read: false }
  }) : 0;

  const session = await auth();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-8 justify-between shrink-0 sticky top-0 z-40">
      <div>
        <p className="text-xs text-gray-400 font-medium">{greeting},</p>
        <h1 className="text-sm font-bold text-gray-800">{user?.name || "User"}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search hint */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-pointer hover:border-indigo-300 transition-colors">
          <Search size={14} />
          <span className="text-xs">Quick search...</span>
          <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono ml-2">⌘K</span>
        </div>

        {/* Bell */}
        <button className="relative p-2.5 bg-gray-50 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all duration-200">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
