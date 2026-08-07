import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";



export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    redirect("/dashboard");
  }

  // Fetch all users with relevant relations for filtering
  const users = await prisma.user.findMany({
    include: {
      branch: true,
      sectionEnrollments: {
        where: { status: "ACTIVE" },
        include: { section: { include: { class: true } } }
      },
      hodDepartments: true,
      classTeachers: {
        include: { section: { include: { class: true } } }
      }
    },
    orderBy: { joinedAt: "desc" }
  });

  const branches = await prisma.branch.findMany();

  return <UserManagementClient initialUsers={users} branches={branches} />;
}
