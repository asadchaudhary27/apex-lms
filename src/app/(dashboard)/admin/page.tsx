import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, GraduationCap, FileText, DollarSign, BarChart3, Settings, Plus } from "lucide-react";



export default async function AdminPortal() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (!["HEAD_ADMIN","ADMIN","FINANCE","HR"].includes(role!)) redirect("/settings");

  const branchId = (session.user as any).branchId;
  const where = branchId ? { branchId } : {};

  const [students, staff, pendingInvoices, overdueCount] = await Promise.all([
    prisma.user.count({ where: { ...where, role: "STUDENT", deletedAt: null } }),
    prisma.user.count({ where: { ...where, role: { notIn: ["STUDENT","PARENT"] }, deletedAt: null } }),
    prisma.feeVoucher.count({ where: { status: "UNPAID" } }),
    prisma.feeVoucher.count({ where: { status: "OVERDUE" } }),
  ]);

  const modules = [
    { title: "Students", desc: "Admissions, profiles, enrollment", icon: GraduationCap, href: "/students", count: students, color: "from-indigo-500 to-purple-600" },
    { title: "Employees", desc: "Staff accounts & permissions", icon: Users, href: "/hr/employees", count: staff, color: "from-cyan-500 to-blue-600" },
    { title: "Fee Management", desc: "Invoices, payments & concessions", icon: DollarSign, href: "/admin/fees", count: `${pendingInvoices} pending`, color: "from-emerald-500 to-teal-600" },
    { title: "Overdue Fees", desc: "Students with late payments", icon: FileText, href: "/admin/fees?status=OVERDUE", count: overdueCount, color: "from-red-500 to-rose-600" },
    { title: "Reports", desc: "Analytics & export data", icon: BarChart3, href: "/reports", color: "from-amber-500 to-orange-600" },
    { title: "Settings", desc: "System configuration", icon: Settings, href: "/settings", color: "from-slate-500 to-gray-600" },
  ];

  return (
    <div className="space-y-8 fade-up">
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)" }}>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5">
          <Users size={160} className="text-white" />
        </div>
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-widest">Administration Portal</p>
          <h1 className="text-3xl font-black text-white mb-2">Management Hub</h1>
          <p className="text-slate-400 text-sm">Manage students, staff, fees and institutional operations.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/students" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Plus size={14} /> Admit Student
            </Link>
            <Link href="/admin/fees" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <FileText size={14} /> Generate Fee Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}
            className="card-lift bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-indigo-100 transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-md`}>
              <mod.icon size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{mod.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{mod.desc}</p>
            {mod.count !== undefined && (
              <p className="text-lg font-black text-gray-700 mt-3">{mod.count}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
