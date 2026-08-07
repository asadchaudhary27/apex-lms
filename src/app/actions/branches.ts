"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function createBranch(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const currency = formData.get("currency") as string;
  const timezone = formData.get("timezone") as string;

  await prisma.branch.create({
    data: { name, address, currency, timezone }
  });

  revalidatePath("/admin/branches");
}

export async function deleteBranch(id: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.branch.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2003") {
      throw new Error("Cannot delete this branch — it still has users, courses, or records associated with it. Please reassign or remove them first.");
    }
    throw e;
  }
  revalidatePath("/admin/branches");
}
