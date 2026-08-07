import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentPortalClient from "./StudentPortalClient";



export default async function StudentPortal() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/settings");

  const studentId = session.user.id!;

  const [results, invoices, enrollments, announcements] = await Promise.all([
    prisma.testResult.findMany({
      where: { studentId },
      include: { exam: { select: { title: true, type: true, totalMarks: true, date: true } }, course: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.feeVoucher.findMany({
      where: { studentId },
      include: { items: { include: { feeCategory: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sectionEnrollment.findMany({
      where: { studentId },
      include: { section: { include: { class: true } } },
    }),
    prisma.announcement.findMany({
      where: { audience: { in: ["ALL","STUDENTS"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
  ]);

  // Build chart data from results
  const chartData = results.slice().reverse().map(r => ({
    label: r.course.name.split(" ")[0],
    marks: r.marksObtained,
    total: r.exam.totalMarks,
    percentage: Math.round(r.percentage || 0),
    grade: r.grade,
    date: new Date(r.exam.date).toISOString().split("T")[0],
    examTitle: r.exam.title,
  }));

  const avgPct = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length)
    : 0;

  return (
    <StudentPortalClient
      studentName={session.user.name || "Student"}
      results={results}
      chartData={chartData}
      invoices={invoices}
      enrollments={enrollments}
      announcements={announcements}
      avgPercentage={avgPct}
    />
  );
}
