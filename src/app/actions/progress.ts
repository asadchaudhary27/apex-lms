"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function markLessonComplete(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed: true },
    create: { userId: session.user.id, lessonId, completed: true }
  });

  revalidatePath(`/learn/${courseId}`);
}

export async function submitQuiz(lessonId: string, courseId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { questions: true }
  });

  if (!lesson || lesson.type !== "QUIZ") throw new Error("Invalid quiz");

  let correctCount = 0;
  lesson.questions.forEach((q) => {
    const answer = formData.get(`q_${q.id}`) as string;
    if (answer === q.answer) correctCount++;
  });

  const score = (correctCount / lesson.questions.length) * 100;

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed: true, score },
    create: { userId: session.user.id, lessonId, completed: true, score }
  });

  revalidatePath(`/learn/${courseId}`);
  return score;
}
