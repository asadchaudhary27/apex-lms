"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireRole, requirePermission, ROLES, PERMISSIONS } from "@/lib/rbac";



// ─── Generate invoice number ────────────────────────────────
function generateInvoiceNo(): string {
  const now = new Date();
  const yyMM = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${yyMM}-${rand}`;
}

// ─── Create fee invoice for a student ─────────────────────────
export async function createFeeVoucher(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.ADMIN);

  const studentId = formData.get("studentId") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const semesterId = formData.get("semesterId") as string | null;
  const notes = formData.get("notes") as string;

  // Get items from form: itemCategory_X, itemAmount_X
  const items: { feeCategoryId: string; amount: number; description: string }[] = [];
  let idx = 0;
  while (formData.get(`itemCategoryId_${idx}`)) {
    items.push({
      feeCategoryId: formData.get(`itemCategoryId_${idx}`) as string,
      amount: parseFloat(formData.get(`itemAmount_${idx}`) as string) || 0,
      description: formData.get(`itemDesc_${idx}`) as string || "",
    });
    idx++;
  }

  if (items.length === 0) throw new Error("At least one fee item is required");

  // Apply concessions
  const concessions = await prisma.concession.findMany({
    where: {
      studentId,
      validFrom: { lte: new Date() },
      OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
    },
  });

  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
  let discountAmount = 0;
  for (const c of concessions) {
    if (c.type === "PERCENTAGE") discountAmount += (totalAmount * c.value) / 100;
    else discountAmount += c.value;
  }
  discountAmount = Math.min(discountAmount, totalAmount);
  const netAmount = totalAmount - discountAmount;

  const invoice = await prisma.feeVoucher.create({
    data: {
      studentId,
      semesterId: semesterId || undefined,
      challanId: generateInvoiceNo(),
      dueDate: new Date(dueDateStr),
      totalAmount,
      discountAmount,
      netAmount,
      notes,
      status: "UNPAID",
      items: {
        create: items,
      },
    },
    include: { items: true },
  });

  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
  return invoice;
}

// ─── Record a payment ──────────────────────────────────────────
export async function recordPayment(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.ADMIN);

  const feeVoucherId = formData.get("feeVoucherId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as string;
  const reference = formData.get("reference") as string;
  const notes = formData.get("notes") as string;

  const invoice = await prisma.feeVoucher.findUniqueOrThrow({
    where: { id: feeVoucherId },
    include: { payments: true },
  });

  const alreadyPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = invoice.netAmount - alreadyPaid;
  if (amount > remaining + 0.01) throw new Error(`Amount exceeds remaining balance of Rs ${remaining.toFixed(2)}`);

  const receiptNo = `RCP-${Date.now()}`;
  await prisma.payment.create({
    data: {
      feeVoucherId,
      studentId: invoice.studentId,
      amount,
      method,
      reference,
      notes,
      receiptNo,
    },
  });

  // Update invoice status
  const newPaid = alreadyPaid + amount;
  let newStatus = "PARTIAL";
  if (newPaid >= invoice.netAmount - 0.01) newStatus = "PAID";

  await prisma.feeVoucher.update({
    where: { id: feeVoucherId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
  return receiptNo;
}

// ─── Apply late fee penalties ─────────────────────────────────
export async function applyLateFees() {
  const session = await auth();
  requireRole(session, ROLES.ADMIN, ROLES.HEAD_ADMIN);

  const now = new Date();
  const overdueInvoices = await prisma.feeVoucher.findMany({
    where: {
      status: { in: ["UNPAID", "PARTIAL"] },
      dueDate: { lt: now },
      penaltyAmount: { equals: 0 },
    },
  });

  const rules = await prisma.lateFeeRule.findMany();
  const defaultRule = rules[0]; // Use first rule as global default

  for (const inv of overdueInvoices) {
    let penalty = 0;
    if (defaultRule) {
      const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
      if (daysOverdue > defaultRule.graceDays) {
        if (defaultRule.penaltyType === "FLAT") penalty = defaultRule.penaltyValue;
        else penalty = (inv.netAmount * defaultRule.penaltyValue) / 100;
        if (defaultRule.maxPenalty) penalty = Math.min(penalty, defaultRule.maxPenalty);
      }
    }

    if (penalty > 0) {
      await prisma.feeVoucher.update({
        where: { id: inv.id },
        data: {
          penaltyAmount: penalty,
          netAmount: inv.netAmount + penalty,
          status: "OVERDUE",
        },
      });
    } else {
      await prisma.feeVoucher.update({
        where: { id: inv.id },
        data: { status: "OVERDUE" },
      });
    }
  }

  revalidatePath("/admin/fees");
  revalidatePath("/dashboard");
}

// ─── Add concession ────────────────────────────────────────────
export async function addConcession(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.ADMIN, ROLES.HEAD_ADMIN);

  await prisma.concession.create({
    data: {
      studentId: formData.get("studentId") as string,
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string),
      reason: formData.get("reason") as string,
      notes: formData.get("notes") as string,
      validFrom: new Date(),
      validTo: formData.get("validTo") ? new Date(formData.get("validTo") as string) : undefined,
    },
  });

  revalidatePath("/admin/fees");
}

// ─── Fee category CRUD ─────────────────────────────────────────
export async function createFeeCategory(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.ADMIN, ROLES.HEAD_ADMIN);

  await prisma.feeCategory.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isRecurring: formData.get("isRecurring") === "true",
      frequency: formData.get("frequency") as string,
      branchId: (session?.user as any)?.branchId || undefined,
    },
  });

  revalidatePath("/admin/fees");
}

// ─── Create late fee rule ──────────────────────────────────────
export async function createLateFeeRule(formData: FormData) {
  const session = await auth();
  requireRole(session, ROLES.HEAD_ADMIN, ROLES.ADMIN);

  await prisma.lateFeeRule.create({
    data: {
      graceDays: parseInt(formData.get("graceDays") as string) || 7,
      penaltyType: formData.get("penaltyType") as string,
      penaltyValue: parseFloat(formData.get("penaltyValue") as string),
      maxPenalty: formData.get("maxPenalty") ? parseFloat(formData.get("maxPenalty") as string) : undefined,
    },
  });

  revalidatePath("/admin/fees");
}
