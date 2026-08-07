"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";



export async function createCourse(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "HEAD_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "HOD")) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const creditHours = parseInt(formData.get("creditHours") as string) || 3;
  const totalMarks = parseFloat(formData.get("totalMarks") as string) || 100;
  const departmentId = formData.get("departmentId") as string;

  await prisma.course.create({
    data: {
      name,
      code,
      description,
      creditHours,
      totalMarks,
      departmentId: departmentId || undefined
    }
  });

  revalidatePath("/courses");
}
