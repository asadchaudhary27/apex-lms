import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { DollarSign, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function FinanceDashboardPage() {
  const session = await auth();
  if (!session?.user || !["FINANCE", "HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    redirect("/dashboard");
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const [totalStudents, unpaidVouchers, recentPayments] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", deletedAt: null } }),
    prisma.feeVoucher.count({ where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paidAt: "desc" },
      include: { student: { select: { name: true, rollNumber: true } } }
    })
  ]);

  const stats = [
    { label: "Pending Vouchers", value: unpaidVouchers.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active Students", value: totalStudents.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Revenue Today", value: "Rs 0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-up">
      <div className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: "linear-gradient(135deg, #0f172a, #1e1b4b)" }}>
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
          <DollarSign size={200} className="text-white" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-black text-white mb-2">Finance Department</h2>
          <p className="text-indigo-200">Manage vouchers, process payroll, and track institutional expenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg}`}>
                <Icon size={24} className={s.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">{s.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-indigo-600" /> Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/admin/fees" className="block w-full py-3 px-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 rounded-xl text-sm font-bold transition-colors">
              Manage Fee Vouchers
            </Link>
            <Link href="/admin/payroll" className="block w-full py-3 px-4 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-sm font-bold transition-colors">
              Process Staff Payroll
            </Link>
            {/* Expense Log is not yet built as a separate page, so just empty for now */}
            <div className="block w-full py-3 px-4 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 text-gray-400 cursor-not-allowed rounded-xl text-sm font-bold transition-colors">
              Log Institutional Expense (Coming soon)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900">
            Recent Payments
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No recent payments.</div>
            ) : (
              recentPayments.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.student?.name || "Unknown"} <span className="text-gray-400 font-normal">({p.student?.rollNumber || "N/A"})</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.method} • {new Date(p.paidAt).toLocaleDateString()} {new Date(p.paidAt).toLocaleTimeString()}</p>
                  </div>
                  <div className="font-black text-emerald-600">
                    +Rs {p.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
