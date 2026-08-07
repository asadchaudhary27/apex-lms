import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import AttendanceClient from "./AttendanceClient";

const prisma = new PrismaClient();

export default async function AttendancePage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const whereClause = isSuperAdmin ? {} : { branchId: session?.user?.branchId || undefined };

  const staff = await prisma.user.findMany({
    where: { ...whereClause, role: { notIn: ["STUDENT"] } },
    include: {
      branch: true,
      attendances: {
        orderBy: { date: "desc" },
        take: 31, // last month
      }
    },
    orderBy: { name: "asc" }
  });

  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Staff Attendance</h2>
        <p className="text-gray-500 mt-1">Track and manage daily attendance for all staff members.</p>
      </div>
      <AttendanceClient staff={staff} branches={branches} branchId={session?.user?.branchId || ""} />
    </div>
  );
}
