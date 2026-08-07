import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export default async function ReportsPage() {
  const session = await auth();
  const whereClause = session?.user?.role === "SUPER_ADMIN" 
    ? {} 
    : { branchId: session?.user?.branchId };

  // Financial Report Data
  const collectedFees = await prisma.payment.aggregate({
    where: { invoice: { type: "FEE", ...whereClause } },
    _sum: { amount: true }
  });

  const payrollProcessed = await prisma.payment.aggregate({
    where: { invoice: { type: "PAYROLL", ...whereClause } },
    _sum: { amount: true }
  });

  // Attendance Report Data
  const recentAttendances = await prisma.attendance.findMany({
    where: whereClause,
    include: { user: true },
    orderBy: { date: "desc" },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">System Reports</h2>
        {/* We use a simple window.print() triggered via an inline client component to avoid making the whole page "use client" */}
        <button 
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          Export as PDF (Ctrl+P)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Financial Overview (All Time)</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Fees Collected</span>
              <span className="font-semibold text-green-600">Rs {(collectedFees._sum.amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Payroll Processed</span>
              <span className="font-semibold text-red-600">Rs {(payrollProcessed._sum.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-64 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Recent Attendance Logs</h3>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 uppercase">
                  <th className="py-2">Date</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAttendances.map(a => (
                  <tr key={a.id}>
                    <td className="py-2">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-2 font-medium">{a.user.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentAttendances.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
