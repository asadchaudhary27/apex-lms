import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PayrollManager from "./PayrollManager";



export default async function AdminPayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["HEAD_ADMIN","ADMIN","HR"].includes(session.user.role!)) redirect("/admin");

  const [employees, employeePayrolls, courses] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["TEACHING_STAFF", "NON_TEACHING_STAFF"] }, deletedAt: null },
      include: { subjectRates: { include: { course: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.employeePayroll.findMany({
      include: { employee: true, items: true },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PayrollManager 
        employees={employees} 
        employeePayrolls={employeePayrolls} 
        courses={courses} 
        currentUserRole={session.user.role!}
      />
    </div>
  );
}
