"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";



export async function logExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["FINANCE", "HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;

  if (!amount || !category || !description) throw new Error("Missing fields");

  await prisma.institutionalExpense.create({
    data: {
      amount,
      category,
      description,
      date: dateStr ? new Date(dateStr) : new Date(),
      recordedById: session.user.id!
    }
  });

  revalidatePath("/finance/expenses");
  revalidatePath("/finance");
}
