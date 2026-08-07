import { prisma } from "@/lib/prisma";
import BranchTable from "./BranchTable";



export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <BranchTable branches={branches} />;
}
