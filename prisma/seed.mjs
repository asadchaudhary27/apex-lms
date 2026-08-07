import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding multi-branch database...");

  // 1. Create Initial Branch
  const hq = await prisma.branch.upsert({
    where: { id: "hq-001" },
    update: {},
    create: {
      id: "hq-001",
      name: "Global Headquarters",
      address: "123 Main St, New York, NY",
      currency: "USD",
      timezone: "EST"
    }
  });
  console.log("Created branch:", hq.name);

  // 2. Create Super Admin
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lms.com" },
    update: {},
    create: {
      email: "superadmin@lms.com",
      name: "Super Admin",
      password: hashedAdminPassword,
      role: "SUPER_ADMIN",
      branchId: hq.id,
      permissions: JSON.stringify({ allAccess: true })
    }
  });
  console.log("Created super admin:", superAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
