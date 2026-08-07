import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import LeaveTable from "./LeaveTable";

const prisma = new PrismaClient();

export default async function LeavesPage() {
  const session = await auth();
  const role = session?.user?.role || "STUDENT";
  
  let whereClause = {};

  if (role === "SUPER_ADMIN") {
    whereClause = {};
  } else if (role === "BRANCH_ADMIN" || role === "HR") {
    // Can see all leaves in their branch
    whereClause = { user: { branchId: session?.user?.branchId } };
  } else {
    // Normal employees can only see their own
    whereClause = { userId: session?.user?.id };
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: whereClause,
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return <LeaveTable leaves={leaves} currentUserRole={role} />;
}
