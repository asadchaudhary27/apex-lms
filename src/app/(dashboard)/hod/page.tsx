import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HODLeaveQueueClient from "./HODLeaveQueueClient";

const prisma = new PrismaClient();

export default async function HODDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["HOD", "HEAD_ADMIN", "ADMIN", "DEPARTMENT_HEAD"].includes(session.user.role!)) {
    redirect("/dashboard");
  }

  // Fetch pending leaves
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });

  const stats = [
    { label: "Pending Leaves", value: pendingLeaves.length, icon: Clock, color: "blue" },
    { label: "Approved Leaves", value: await prisma.leaveRequest.count({ where: { status: "APPROVED" } }), icon: CheckCircle, color: "green" },
    { label: "Department Staff", value: 28, icon: Users, color: "indigo" },
    { label: "Audit Tickets", value: 3, icon: FileText, color: "amber" },
  ];

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Head of Department Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Manage departmental faculty, approve leaves, and oversee academic records.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden`}>
              <div className={`absolute -right-2 -top-2 opacity-5 text-${s.color}-600`}>
                <Icon size={80} />
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">{s.value}</div>
              <div className="text-xs font-semibold text-gray-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <HODLeaveQueueClient initialLeaves={pendingLeaves} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Audit Tickets</h2>
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Record modification tickets pending HOD review.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
