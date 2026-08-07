import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, ROLES } from "@/lib/rbac";
import { approveDeletion } from "@/app/actions/gradebook";
import AuditQueueClient from "./AuditQueueClient";
import {
  Users, GraduationCap, AlertTriangle, TrendingUp,
  CheckCircle, XCircle, Clock, ArrowRight, DollarSign,
  BarChart3, ShieldCheck,
} from "lucide-react";



function StatCard({ label, value, sub, icon: Icon, gradient }: {
  label: string; value: string | number; sub?: string; icon: any; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white`} style={{ background: gradient }}>
      <div className="absolute -right-4 -top-4 opacity-20">
        <Icon size={80} />
      </div>
      <Icon size={22} className="mb-4 opacity-90" />
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="font-semibold text-sm opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

export default async function HeadAdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "HEAD_ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/");

  const [
    totalStudents, totalStaff, auditTickets,
    feeCollected, feePending, recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", deletedAt: null } }),
    prisma.user.count({ where: { role: { notIn: ["STUDENT", "PARENT"] }, deletedAt: null } }),
    prisma.auditTicket.findMany({ where: { status: "PENDING_HEAD_ADMIN_APPROVAL" }, include: { requestedBy: true }, orderBy: { createdAt: "desc" } }),
    prisma.feeVoucher.aggregate({ where: { status: "PAID" }, _sum: { netAmount: true } }),
    prisma.feeVoucher.aggregate({ where: { status: { in: ["UNPAID", "OVERDUE", "PARTIAL"] } }, _sum: { netAmount: true } }),
    prisma.user.findMany({ orderBy: { joinedAt: "desc" }, take: 5, where: { deletedAt: null } }),
  ]);

  const pendingRequests = auditTickets.length;
  const collected = feeCollected._sum.netAmount || 0;
  const pending = feePending._sum.netAmount || 0;
  const collectionRate = collected + pending > 0 ? Math.round((collected / (collected + pending)) * 100) : 0;

  return (
    <div className="space-y-8 fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-400" style={{ transform: "translate(30%,-30%)" }} />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-indigo-400" />
              <span className="text-indigo-300 text-sm font-semibold tracking-wide uppercase">Head Admin Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Institution Overview</h1>
            <p className="text-indigo-200 text-sm">
              {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {pendingRequests > 0 && (
            <Link href="#approvals"
              className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded-2xl px-5 py-4 hover:bg-red-500/30 transition-all">
              <AlertTriangle size={20} />
              <div>
                <p className="font-bold">{pendingRequests} Pending Audit{pendingRequests !== 1 ? "s" : ""}</p>
                <p className="text-xs opacity-80">Requires your review</p>
              </div>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Students" value={totalStudents} sub="Active enrollments" icon={GraduationCap} gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard label="Total Staff" value={totalStaff} sub="All roles" icon={Users} gradient="linear-gradient(135deg,#0ea5e9,#06b6d4)" />
        <StatCard label="Revenue Collected" value={`Rs ${(collected/1000).toFixed(0)}K`} sub={`${collectionRate}% collection rate`} icon={TrendingUp} gradient="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Outstanding Fees" value={`Rs ${(pending/1000).toFixed(0)}K`} sub="Across all students" icon={AlertTriangle} gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Manage Users", href: "/admin", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Fee Management", href: "/admin/fees", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Reports", href: "/reports", icon: BarChart3, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Settings", href: "/settings", icon: ShieldCheck, color: "text-purple-600 bg-purple-50 border-purple-100" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`card-lift flex items-center gap-3 p-4 rounded-2xl border ${item.color} transition-all`}>
            <item.icon size={20} />
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      <div id="approvals">
        <AuditQueueClient tickets={auditTickets} />
      </div>

      {/* Recent Activity / Users */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6 lg:mt-0">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> Recent Registrations
          </h3>
          <p className="text-xs text-gray-500 mt-1">Latest users added to the system</p>
        </div>
        <div className="divide-y divide-gray-50">
          {recentUsers.map(u => (
            <div key={u.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                {u.name?.[0] || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="ml-auto text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                {u.role}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
