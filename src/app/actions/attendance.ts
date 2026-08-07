"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function markAttendance(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = formData.get("userId") as string;
  const status = formData.get("status") as string;
  const dateStr = formData.get("date") as string;
  const branchId = (formData.get("branchId") as string) || session.user.branchId || "";

  if (!userId || !status || !dateStr) throw new Error("Missing required fields");

  const date = new Date(dateStr);
  // Upsert: if already marked for this user+date, update it
  const existing = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: new Date(date.toISOString().split("T")[0]),
        lt: new Date(new Date(date.getTime() + 86400000).toISOString().split("T")[0]),
      },
      type: "EMPLOYEE",
    }
  });

  if (existing) {
    await prisma.attendance.update({ where: { id: existing.id }, data: { status } });
  } else {
    await prisma.attendance.create({
      data: { userId, branchId, status, type: "EMPLOYEE", date }
    });
  }

  revalidatePath("/hr/attendance");
}

export async function updateStaffBioData(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = formData.get("userId") as string;
  const phone = formData.get("phone") as string;
  const cnic = formData.get("cnic") as string;
  const address = formData.get("address") as string;
  const designation = formData.get("designation") as string;
  const bio = formData.get("bio") as string;
  const education = formData.get("education") as string;

  await prisma.user.update({
    where: { id: userId },
    data: { phone, cnic, address, designation, bio, education }
  });

  revalidatePath("/hr/employees");
  revalidatePath("/hr/attendance");
}

export async function markBulkStudentAttendance(
  sectionId: string, 
  courseId: string, 
  dateStr: string, 
  records: { userId: string; status: string }[]
) {
  const session = await auth();
  if (!session?.user || !["TEACHER", "HOD", "ADMIN", "HEAD_ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const branchId = session.user.branchId || "";
  if (!sectionId || !dateStr || records.length === 0) {
    throw new Error("Missing required fields");
  }

  const date = new Date(dateStr);
  const startOfDay = new Date(date.toISOString().split("T")[0]);
  const endOfDay = new Date(new Date(date.getTime() + 86400000).toISOString().split("T")[0]);

  // Use a transaction for bulk upsert
  await prisma.$transaction(
    records.map(record => {
      return prisma.attendance.upsert({
        where: {
          userId_courseId_sectionId_date: {
            userId: record.userId,
            courseId: courseId,
            sectionId: sectionId,
            date: startOfDay,
          }
        },
        update: {
          status: record.status,
        },
        create: {
          userId: record.userId,
          branchId,
          courseId,
          sectionId,
          type: "STUDENT",
          date: startOfDay,
          status: record.status,
        }
      });
    })
  );

  revalidatePath("/teacher/attendance");
}
