"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireRole, ROLES } from "@/lib/rbac";

const prisma = new PrismaClient();

// ─── Grade scale ───────────────────────────────────────────────
function toGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

// ─── Create/update an exam ─────────────────────────────────────
export async function saveExam(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.TEACHER, ROLES.HOD, ROLES.ADMIN);

  const id = formData.get("id") as string | null;
  const data = {
    sectionId: (formData.get("sectionId") as string) || undefined,
    courseId: formData.get("courseId") as string,
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    totalMarks: parseFloat(formData.get("totalMarks") as string),
    passingMarks: parseFloat(formData.get("passingMarks") as string),
    date: new Date(formData.get("date") as string),
    venue: (formData.get("venue") as string) || undefined,
    createdById: session!.user!.id!,
  };

  if (id) {
    await prisma.exam.update({ where: { id }, data });
  } else {
    await prisma.exam.create({ data });
  }

  revalidatePath("/teacher/gradebook");
  revalidatePath("/student/grades");
}

// ─── Submit test results (bulk) ────────────────────────────────
export async function submitResults(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.TEACHER, ROLES.HOD, ROLES.ADMIN);

  const examId = formData.get("examId") as string;
  const exam = await prisma.exam.findUniqueOrThrow({ where: { id: examId } });
  const gradedById = session!.user!.id!;

  // Parse studentIds and marks from formData
  const studentIds = formData.getAll("studentId") as string[];
  const marksList = formData.getAll("marks") as string[];

  const upserts = studentIds.map(async (studentId, i) => {
    const marksObtained = parseFloat(marksList[i]) || 0;
    const percentage = (marksObtained / exam.totalMarks) * 100;
    const grade = toGrade(percentage);

    return prisma.testResult.upsert({
      where: { studentId_examId: { studentId, examId } },
      update: { marksObtained, percentage, grade, gradedById },
      create: { studentId, examId, courseId: exam.courseId, marksObtained, percentage, grade, gradedById },
    });
  });

  await Promise.all(upserts);
  revalidatePath("/teacher/gradebook");
  revalidatePath("/student/grades");
}

// ─── Recompute gradebook for a student in a semester ──────────
export async function recomputeGradebook(studentId: string, semesterId: string) {
  const results = await prisma.testResult.findMany({
    where: { studentId },
    include: { exam: true },
  });

  if (results.length === 0) return;

  const totalWeighted = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
  const avgPercentage = totalWeighted / results.length;
  // Simple GPA: 4.0 scale
  const gpa = Math.min(4.0, (avgPercentage / 100) * 4.0);

  await prisma.gradebook.upsert({
    where: { studentId_semesterId: { studentId, semesterId } },
    update: { percentage: avgPercentage, gpa },
    create: { studentId, semesterId, percentage: avgPercentage, gpa },
  });
}

// ─── Create exam (for admin) ───────────────────────────────────
export async function createDeletionRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthenticated");
  if (session.user.role === "HEAD_ADMIN") throw new Error("HEAD_ADMIN can delete directly");
  if (session.user.role === "STUDENT" || session.user.role === "PARENT")
    throw new Error("Not authorized to request deletions");

  await prisma.deletionRequest.create({
    data: {
      requestedById: session.user.id!,
      targetModel: formData.get("targetModel") as string,
      targetId: formData.get("targetId") as string,
      targetLabel: formData.get("targetLabel") as string,
      reason: formData.get("reason") as string,
      status: "PENDING",
    },
  });

  // Notify all HEAD_ADMINs
  const admins = await prisma.user.findMany({ where: { role: "HEAD_ADMIN" } });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      title: "Deletion Approval Required",
      message: `${session.user!.name} requested deletion of: ${formData.get("targetLabel")}`,
      type: "APPROVAL",
    })),
  });

  revalidatePath("/dashboard");
}

export async function approveDeletion(requestId: string, approve: boolean, rejectedReason?: string) {
  const session = await auth();
  requireRole(session, ROLES.HEAD_ADMIN);

  const req = await prisma.deletionRequest.findUniqueOrThrow({ where: { id: requestId } });

  if (approve) {
    // Execute soft delete by setting deletedAt where available, otherwise hard delete
    try {
      const modelName = req.targetModel.toLowerCase();
      if (modelName === "user") {
        await prisma.user.update({ where: { id: req.targetId }, data: { deletedAt: new Date() } });
      } else if (modelName === "feeinvoice") {
        await prisma.feeVoucher.update({ where: { id: req.targetId }, data: { deletedAt: new Date() } });
      } else {
        // Generic hard delete for models without soft delete
        await (prisma as any)[modelName].delete({ where: { id: req.targetId } });
      }
    } catch (e: any) {
      throw new Error("Failed to execute deletion: " + e.message);
    }

    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: { status: "EXECUTED", approvedById: session!.user!.id!, approvedAt: new Date() },
    });
  } else {
    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", rejectedReason },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: req.requestedById,
        title: "Deletion Request Rejected",
        message: `Your deletion request for "${req.targetLabel}" was rejected. Reason: ${rejectedReason || "Not specified"}`,
        type: "APPROVAL",
      },
    });
  }

  revalidatePath("/dashboard");
}
