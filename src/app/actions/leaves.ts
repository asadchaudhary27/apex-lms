"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

import { writeFile } from "fs/promises";
import path from "path";

export async function requestLeave(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id as string;
  const type = formData.get("type") as string || "CASUAL";
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const reason = formData.get("reason") as string;
  
  const file = formData.get("attachment") as File | null;
  let attachmentUrl = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filepath, buffer);
    attachmentUrl = `/uploads/${filename}`;
  }

  await prisma.leaveRequest.create({
    data: {
      userId,
      type,
      startDate,
      endDate,
      reason,
      attachmentUrl
    }
  });

  revalidatePath("/teacher/leaves");
  revalidatePath("/hr/leaves");
}

export async function resolveLeave(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BRANCH_ADMIN" && session.user.role !== "HR")) {
    throw new Error("Unauthorized");
  }

  const leaveId = formData.get("leaveId") as string;
  const status = formData.get("status") as string; // APPROVED or REJECTED

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status }
  });

  revalidatePath("/hr/leaves");
}
