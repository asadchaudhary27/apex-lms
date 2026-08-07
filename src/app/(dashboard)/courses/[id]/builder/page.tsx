import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import BuilderUI from "./BuilderUI";

const prisma = new PrismaClient();

export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { questions: true }
          }
        }
      }
    }
  });

  if (!course) notFound();

  return <BuilderUI course={course} />;
}
