import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FeeManager from "./FeeManager";



export default async function AdminFeesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["HEAD_ADMIN","ADMIN"].includes(session.user.role!)) redirect("/admin");

  const [students, classes, categories, invoices, lateFeeRules] = await Promise.all([
    prisma.user.findMany({ 
      where: { role: "STUDENT", deletedAt: null }, 
      select: { 
        id: true, 
        name: true, 
        email: true,
        rollNumber: true,
        sectionEnrollments: {
          where: { status: "ACTIVE" },
          include: { section: { include: { class: true } } }
        }
      }, 
      orderBy: { name: "asc" } 
    }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { name: "asc" }
    }),
    prisma.feeCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.feeVoucher.findMany({
      include: { 
        student: { 
          select: { 
            name: true, 
            email: true,
            sectionEnrollments: {
              where: { status: "ACTIVE" },
              include: { section: { include: { class: true } } }
            }
          } 
        }, 
        items: { include: { feeCategory: true } }, 
        payments: true 
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Increased to 100
    }),
    prisma.lateFeeRule.findMany(),
  ]);

  return (
    <FeeManager
      students={students}
      classes={classes}
      categories={categories}
      invoices={invoices}
      lateFeeRules={lateFeeRules}
    />
  );
}
