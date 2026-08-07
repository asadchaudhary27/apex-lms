"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function createModule(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "BRANCH_ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  await prisma.module.create({
    data: { courseId, title, order }
  });

  revalidatePath(`/courses/${courseId}/builder`);
}

export async function createLesson(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "BRANCH_ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const moduleId = formData.get("moduleId") as string;
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string; // VIDEO, TEXT, QUIZ
  const content = formData.get("content") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  await prisma.lesson.create({
    data: { moduleId, title, type, content, videoUrl, order }
  });

  revalidatePath(`/courses/${courseId}/builder`);
}

export async function createQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "BRANCH_ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const lessonId = formData.get("lessonId") as string;
  const courseId = formData.get("courseId") as string;
  const text = formData.get("text") as string;
  const options = formData.get("options") as string; // JSON string
  const answer = formData.get("answer") as string;

  await prisma.question.create({
    data: { lessonId, text, options, answer }
  });

  revalidatePath(`/courses/${courseId}/builder`);
}
