import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import CourseTable from "./CourseTable";



export default async function CoursesPage() {
  const session = await auth();
  
  // Find courses, optionally filtering if we had a specific branch scope via department
  const courses = await prisma.course.findMany({
    include: { department: true },
    orderBy: { createdAt: "desc" }
  });

  const departments = await prisma.department.findMany();

  return <CourseTable courses={courses} departments={departments} />;
}
