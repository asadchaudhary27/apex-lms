"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";



export async function enrollStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const studentId = formData.get("studentId") as string;
  const sectionId = formData.get("sectionId") as string;
  const rollNo = formData.get("rollNo") as string;

  if (!sectionId || !rollNo) throw new Error("Section and Roll Number are required.");

  // Prevent duplicate enrollment in the same section
  const existing = await prisma.sectionEnrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } }
  });

  if (existing) {
    throw new Error("Student is already enrolled in this section.");
  }

  await prisma.sectionEnrollment.create({
    data: {
      studentId,
      sectionId,
      rollNo
    }
  });

  revalidatePath("/students");
}

export async function recordAttendance(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN", "TEACHER", "HR"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const userId = formData.get("userId") as string;
  const status = formData.get("status") as string;
  const type = formData.get("type") as string; // STUDENT or EMPLOYEE
  let branchId = (session.user as any).branchId as string;

  if (!branchId) throw new Error("No branch associated with user");

  await prisma.attendance.create({
    data: {
      userId,
      status,
      type,
      branchId,
      date: new Date()
    }
  });

  if (type === "STUDENT") {
    revalidatePath("/students");
  } else {
    revalidatePath("/hr/employees");
  }
}
