import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import EmployeeTable from "./EmployeeTable";

const prisma = new PrismaClient();

export default async function EmployeesPage() {
  const session = await auth();
  
  // Filter by branch unless SUPER_ADMIN
  const whereClause = session?.user?.role === "SUPER_ADMIN" 
    ? { role: { not: "STUDENT" } }
    : { branchId: session?.user?.branchId, role: { not: "STUDENT" } };

  const employees = await prisma.user.findMany({
    where: whereClause,
    include: { branch: true },
    orderBy: { joinedAt: "desc" }
  });

  const branches = await prisma.branch.findMany();

  return <EmployeeTable employees={employees} branches={branches} />;
}
