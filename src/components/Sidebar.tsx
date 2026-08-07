"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
  LogOut,
  WalletCards,
  Settings,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    permissions?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const role = user.role || "STUDENT";
  const parsedPerms = user.permissions ? JSON.parse(user.permissions) : [];
  const userPermissions = Array.isArray(parsedPerms) ? parsedPerms : Object.keys(parsedPerms).filter(k => parsedPerms[k]);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR", "FINANCE", "TEACHER", "STUDENT"] },
    { name: "Branches", href: "/admin/branches", icon: Building2, roles: ["HEAD_ADMIN", "SUPER_ADMIN"] },
    { name: "Employees", href: "/hr/employees", icon: Users, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR"], perm: "MANAGE_USERS" },
    { name: "Staff Attendance", href: "/hr/attendance", icon: ClipboardList, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR"] },
    { name: "Leave Requests", href: "/hr/leaves", icon: FileText, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR", "TEACHER", "FINANCE"], perm: "MANAGE_LEAVES" },
    { name: "Students", href: "/students", icon: GraduationCap, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR", "FINANCE"] },
    { name: "Courses", href: "/courses", icon: BookOpen, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "TEACHER"], perm: "MANAGE_COURSES" },
    { name: "Student Fees", href: "/admin/fees", icon: WalletCards, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "FINANCE"], perm: "VIEW_FINANCE" },
    { name: "Finance & Payroll", href: "/finance", icon: WalletCards, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "FINANCE"], perm: "VIEW_FINANCE" },
    { name: "Reports", href: "/reports", icon: FileText, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR", "FINANCE"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["HEAD_ADMIN", "SUPER_ADMIN", "ADMIN", "HR", "FINANCE", "TEACHER", "STUDENT", "STAFF", "PARENT"] },
  ];

  const visibleNav = navigation.filter(item =>
    item.roles.includes(role) || (item.perm && userPermissions.includes(item.perm))
  );

  const roleColors: Record<string, string> = {
    HEAD_ADMIN: "bg-purple-500/20 text-purple-300",
    SUPER_ADMIN: "bg-purple-500/20 text-purple-300",
    ADMIN: "bg-blue-500/20 text-blue-300",
    BRANCH_ADMIN: "bg-blue-500/20 text-blue-300",
    HR: "bg-green-500/20 text-green-300",
    FINANCE: "bg-amber-500/20 text-amber-300",
    TEACHER: "bg-cyan-500/20 text-cyan-300",
    HOD: "bg-cyan-600/20 text-cyan-400",
    INSTRUCTOR: "bg-cyan-500/20 text-cyan-300",
    STUDENT: "bg-pink-500/20 text-pink-300",
    STAFF: "bg-slate-500/20 text-slate-300",
    PARENT: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div className="w-64 flex flex-col h-full shrink-0" style={{ background: "linear-gradient(180deg, var(--theme-sidebar-start, #0f172a) 0%, var(--theme-sidebar-end, #1e1b4b) 100%)" }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 mr-3 rounded-md" />
        <div>
          <span className="text-white font-bold text-sm tracking-tight">ApexOrion</span>
          <div className="text-indigo-400 text-[10px] font-medium tracking-widest uppercase">LMS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl" style={{ background: "var(--theme-active-bg, linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2)))", border: "1px solid var(--theme-active-border, rgba(99,102,241,0.3))" }} />
              )}
              <Icon size={17} className={`relative z-10 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="relative z-10 font-medium text-sm">{item.name}</span>
              {isActive && <ChevronRight size={14} className="relative z-10 ml-auto text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-xs font-semibold truncate">{user.name || "User"}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleColors[role] || "bg-slate-500/20 text-slate-300"}`}>
              {role.replace("_", " ")}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={17} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
