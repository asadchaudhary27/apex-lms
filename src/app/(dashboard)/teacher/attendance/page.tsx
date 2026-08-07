import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TeacherAttendanceClient from "./TeacherAttendanceClient";



export default async function TeacherAttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["TEACHER", "HOD", "HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    redirect("/dashboard");
  }

  // Fetch sections the teacher is assigned to, or all sections if Admin
  const filter = ["HEAD_ADMIN", "ADMIN", "HOD"].includes(session.user.role!) 
    ? {} 
    : { classTeachers: { some: { teacherId: session.user.id } } };

  const sections = await prisma.section.findMany({
    where: filter,
    include: {
      class: true,
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            select: { id: true, name: true, email: true, rollNumber: true }
          }
        }
      }
    }
  });

  return <TeacherAttendanceClient initialSections={sections} />;
}
