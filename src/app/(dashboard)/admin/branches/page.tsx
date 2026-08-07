import { PrismaClient } from "@prisma/client";
import BranchTable from "./BranchTable";

const prisma = new PrismaClient();

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <BranchTable branches={branches} />;
}
