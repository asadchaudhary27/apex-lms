import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import StudentTable from "./StudentTable";
import { redirect } from "next/navigation";



export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const role = session.user.role;
  if (!["HEAD_ADMIN", "ADMIN", "HOD", "HR", "FINANCE"].includes(role as string)) {
    redirect("/dashboard");
  }

  const branchId = (session.user as any).branchId;
  const whereClause = role === "HEAD_ADMIN" 
    ? { role: "STUDENT", deletedAt: null }
    : { branchId, role: "STUDENT", deletedAt: null };

  const students = await prisma.user.findMany({
    where: whereClause,
    include: { branch: true, sectionEnrollments: { include: { section: { include: { class: true } } } } },
    orderBy: { joinedAt: "desc" }
  });

  const sections = await prisma.section.findMany({
    include: { class: true }
  });

  return <StudentTable students={students} sections={sections} />;
}
