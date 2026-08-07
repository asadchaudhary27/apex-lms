import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ExpenseManager from "./ExpenseManager";



export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user || !["FINANCE", "HEAD_ADMIN", "ADMIN"].includes(session.user.role!)) {
    redirect("/dashboard");
  }

  const expenses = await prisma.institutionalExpense.findMany({
    orderBy: { date: "desc" }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ExpenseManager expenses={expenses} userId={session.user.id} />
    </div>
  );
}
