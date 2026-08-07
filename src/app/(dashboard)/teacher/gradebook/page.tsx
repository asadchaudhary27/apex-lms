import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GradebookClient from "./GradebookClient";



export default async function GradebookPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const teacherId = session.user.id!;

  const [myClasses, exams] = await Promise.all([
    prisma.classTeacher.findMany({
      where: { teacherId },
      include: {
        section: {
          include: {
            class: true,
            enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
          },
        },
        course: true,
      },
    }),
    prisma.exam.findMany({
      where: { createdById: teacherId },
      include: { testResults: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return <GradebookClient myClasses={myClasses} exams={exams} teacherId={teacherId} />;
}
