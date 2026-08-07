import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ParentPortalClient from "./ParentPortalClient";

const prisma = new PrismaClient();

export default async function ParentPortal() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/settings");

  const parentId = session.user.id!;

  const links = await prisma.parentStudent.findMany({
    where: { parentId },
    include: {
      student: {
        include: {
          testResults: {
            include: { exam: true, course: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          feeVouchers: { orderBy: { createdAt: "desc" }, take: 5, include: { payments: true } },
          attendances: { orderBy: { date: "desc" }, take: 30 },
          sectionEnrollments: { include: { section: { include: { class: true } } } },
        },
      },
    },
  });

  if (links.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 fade-up">
        <div className="text-center">
          <div className="text-4xl mb-4">👪</div>
          <h3 className="font-bold text-gray-800 text-lg">No children linked yet</h3>
          <p className="text-gray-400 text-sm mt-1">Please contact administration to link your student profile.</p>
        </div>
      </div>
    );
  }

  return <ParentPortalClient links={links} parentName={session.user.name || "Parent"} />;
}
