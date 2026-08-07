import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BuilderUI from "./BuilderUI";



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
