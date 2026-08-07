"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";



export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BRANCH_ADMIN" && session.user.role !== "HR")) {
    throw new Error("Unauthorized to create users");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  let branchId = formData.get("branchId") as string;
  const permissions = formData.get("permissions") as string || "[]";

  // Branch Admins and HR can only create users in their own branch
  if (session.user.role !== "SUPER_ADMIN") {
    branchId = session.user.branchId!;
  }

  const password = await bcrypt.hash("temp123", 10); // Default temporary password

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      branchId: branchId || null,
      password,
      permissions
    }
  });

  if (role === "STUDENT") {
    revalidatePath("/students");
  } else {
    revalidatePath("/hr/employees");
  }
  revalidatePath("/admin/users");
}

export async function resetUserPassword(userId: string) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }
  
  const password = await bcrypt.hash("college123", 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password }
  });
}

export async function toggleUserSuspension(userId: string, suspend: boolean) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: suspend ? new Date() : null }
  });
  
  revalidatePath("/admin/users");
}

export async function generateMagicLink(userId: string) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // In a real app, generate a secure token and send via email.
  // For now, log to console as requested for testing.
  const magicLink = `http://localhost:3000/login?magic_token=demo-token-${user.id}`;
  console.log(`[MAGIC LINK GENERATED] Sent to ${user.email}: ${magicLink}`);
  
  return magicLink;
}
