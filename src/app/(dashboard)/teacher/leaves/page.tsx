import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LeaveRequestClient from "./LeaveRequestClient";

const prisma = new PrismaClient();

export default async function TeacherLeavesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return <LeaveRequestClient initialLeaves={leaves} />;
}
