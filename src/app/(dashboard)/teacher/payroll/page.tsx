import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";

const prisma = new PrismaClient();

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  DRAFT:            { bg: "bg-gray-100", text: "text-gray-700", icon: FileText },
  PENDING_APPROVAL: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  APPROVED:         { bg: "bg-blue-50",  text: "text-blue-700",  icon: CheckCircle },
  DISBURSED:        { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
};

export default async function EmployeePayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHING_STAFF") redirect("/dashboard");

  const slips = await prisma.employeePayroll.findMany({
    where: { employeeId: session.user.id },
    include: { items: true },
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 fade-up">
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg,#1e40af,#1e3a8a)" }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <DollarSign size={100} className="text-white" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">My Salary Slips</h2>
            <p className="text-blue-200 text-sm mt-1">View your monthly compensation and deductions</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {slips.map(slip => {
          const sStyle = STATUS_STYLE[slip.status] || STATUS_STYLE.DRAFT;
          const SIcon = sStyle.icon;

          return (
            <div key={slip.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-black text-gray-900">
                    {new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${sStyle.bg} ${sStyle.text}`}>
                    <SIcon size={12} /> {slip.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Base Salary: Rs {slip.baseSalary.toLocaleString()}</p>
                  <p>Allowances: <span className="text-emerald-600 font-semibold">+Rs {slip.subjectAllowances.toLocaleString()}</span></p>
                  <p>Deductions: <span className="text-red-500 font-semibold">-Rs {slip.deductions.toLocaleString()}</span></p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[200px]">
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Net Payable</div>
                  <div className="text-2xl font-black text-blue-700">Rs {slip.netAmount.toLocaleString()}</div>
                </div>
                {slip.status === "DISBURSED" && slip.disbursedAt && (
                  <div className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    Disbursed on {slip.disbursedAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {slips.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No salary slips found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
