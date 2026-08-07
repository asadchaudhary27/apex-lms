"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";



export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) throw new Error("Name and email are required");

  // Check if email is already taken by another user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== session.user.id) {
    throw new Error("Email is already in use by another account");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Incorrect current password");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword }
  });

  revalidatePath("/settings");
}

export async function updateTheme(theme: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { themePreference: theme }
  });

  revalidatePath("/");
}
