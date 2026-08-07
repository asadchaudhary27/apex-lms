"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function generateInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BRANCH_ADMIN" && session.user.role !== "FINANCE")) {
    throw new Error("Unauthorized");
  }

  const userId = formData.get("userId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string; // FEE or PAYROLL
  const installments = parseInt(formData.get("installments") as string) || 1;
  const dueDateStr = formData.get("dueDate") as string;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.branchId) {
    throw new Error("User must belong to a branch");
  }

  const baseDueDate = dueDateStr ? new Date(dueDateStr) : new Date();
  const installmentAmount = amount / installments;

  for (let i = 0; i < installments; i++) {
    const installmentDueDate = new Date(baseDueDate);
    installmentDueDate.setMonth(baseDueDate.getMonth() + i);

    await prisma.invoice.create({
      data: {
        userId,
        amount: installmentAmount,
        type,
        branchId: user.branchId,
        status: "PENDING",
        dueDate: installmentDueDate
      }
    });
  }

  revalidatePath("/finance");
}

export async function processPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BRANCH_ADMIN" && session.user.role !== "FINANCE")) {
    throw new Error("Unauthorized");
  }

  const invoiceId = formData.get("invoiceId") as string;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");
  
  if (invoice.status === "PAID") {
    throw new Error("Invoice already paid");
  }

  await prisma.payment.create({
    data: {
      invoiceId,
      amount: invoice.amount
    }
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID" }
  });

  revalidatePath("/finance");
  revalidatePath("/finance");
  revalidatePath("/dashboard"); // Payments affect global revenue
}

// ─────────────────────────────────────────────────────────────
// STUDENT FEE MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function generateFeeVouchers(classId: string, dueDateStr: string, issueDateStr?: string) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN", "FINANCE"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const dueDate = new Date(dueDateStr);
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();

  // Get all active students in the class
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      deletedAt: null,
      sectionEnrollments: { some: { status: "ACTIVE", section: { classId } } }
    }
  });

  // Get fee structure for the class
  const feeStructures = await prisma.feeStructure.findMany({
    where: { classId },
    include: { feeCategory: true }
  });

  if (feeStructures.length === 0) {
    throw new Error("No fee structures defined for this class");
  }

  const totalBaseAmount = feeStructures.reduce((acc, fs) => acc + fs.amount, 0);

  // Generate vouchers
  let count = 0;
  for (const student of students) {
    // 1. Calculate base fee based on class fee structures
    let totalBaseAmount = feeStructures.reduce((acc, fs) => acc + fs.amount, 0);

    // 2. Fetch student's BillingPlan if any (e.g. LUMP_SUM, QUARTERLY discounts)
    const billingPlan = await prisma.billingPlan.findUnique({
      where: { studentId: student.id }
    });

    let planDiscount = 0;
    if (billingPlan && billingPlan.discountPct > 0) {
      planDiscount = totalBaseAmount * (billingPlan.discountPct / 100);
    }

    // 3. Fetch past UNPAID or PARTIAL vouchers to calculate Arrears
    const pastVouchers = await prisma.feeVoucher.findMany({
      where: { 
        studentId: student.id, 
        status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] },
        dueDate: { lt: issueDate }
      },
      include: { payments: true }
    });

    let arrears = 0;
    for (const pv of pastVouchers) {
      const paid = pv.payments.reduce((sum, p) => sum + p.amount, 0);
      arrears += (pv.netAmount - paid);
    }

    // 4. Calculate Concessions
    const concessions = await prisma.concession.findMany({
      where: {
        studentId: student.id,
        validFrom: { lte: issueDate },
        OR: [{ validTo: null }, { validTo: { gte: issueDate } }]
      }
    });

    let discountAmount = planDiscount; // start with plan discount
    for (const c of concessions) {
      if (c.type === "PERCENTAGE") discountAmount += totalBaseAmount * (c.value / 100);
      if (c.type === "FLAT") discountAmount += c.value;
    }

    // 5. Calculate Final Net Amount
    const penaltyAmount = arrears > 0 ? 500 : 0; // Flat penalty for arrears as an example
    const netAmount = Math.max(0, totalBaseAmount + arrears + penaltyAmount - discountAmount);

    const invoice = await prisma.feeVoucher.create({
      data: {
        studentId: student.id,
        challanId: `CH-${Date.now().toString().slice(-6)}-${student.id.slice(-4).toUpperCase()}`,
        issueDate,
        dueDate,
        totalAmount: totalBaseAmount,
        arrears,
        penaltyAmount,
        discountAmount,
        netAmount,
        status: netAmount === 0 ? "PAID" : "UNPAID",
      }
    });

    // Create line items
    for (const fs of feeStructures) {
      await prisma.voucherLineItem.create({
        data: {
          feeVoucherId: invoice.id,
          feeCategoryId: fs.feeCategoryId,
          amount: fs.amount,
          description: fs.feeCategory.name
        }
      });
    }

    count++;
  }

  revalidatePath("/admin/fees");
  return count;
}

export async function recordStudentPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN", "FINANCE"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const feeVoucherId = formData.get("feeVoucherId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as string;
  const reference = formData.get("reference") as string;

  const invoice = await prisma.feeVoucher.findUnique({
    where: { id: feeVoucherId },
    include: { payments: true }
  });
  if (!invoice) throw new Error("Invoice not found");

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + amount;
  
  let newStatus = invoice.status;
  if (totalPaid >= invoice.netAmount) {
    newStatus = "PAID";
  } else if (totalPaid > 0) {
    newStatus = "PARTIAL";
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        feeVoucherId,
        studentId: invoice.studentId,
        amount,
        method,
        reference,
        recordedById: session.user.id!
      }
    }),
    prisma.feeVoucher.update({
      where: { id: feeVoucherId },
      data: { status: newStatus }
    })
  ]);

  revalidatePath("/admin/fees");
}

// ─────────────────────────────────────────────────────────────
// TEACHING_STAFF PAYROLL
// ─────────────────────────────────────────────────────────────

export async function generatePayroll(month: number, year: number) {
  const session = await auth();
  if (!session?.user || !["HEAD_ADMIN", "ADMIN", "HR"].includes(session.user.role!)) {
    throw new Error("Unauthorized");
  }

  const employees = await prisma.user.findMany({
    where: { 
      role: { in: ["TEACHING_STAFF", "NON_TEACHING_STAFF"] }, 
      deletedAt: null 
    },
    include: { subjectRates: { include: { course: true } } }
  });

  let generatedCount = 0;
  for (const employee of employees) {
    // Check if payroll already exists for this month
    const existing = await prisma.employeePayroll.findUnique({
      where: { employeeId_month_year: { employeeId: employee.id, month, year } }
    });
    if (existing) continue; // Skip if already generated

    let subjectAllowances = 0;
    const items = [];

    // Base Salary
    if (employee.baseSalary > 0) {
      items.push({ type: "ALLOWANCE", amount: employee.baseSalary, description: "Base Monthly Salary" });
    }

    // Overtime for non-teaching staff (or hourly teaching staff)
    if (employee.overtimeHours > 0 && employee.hourlyRate > 0) {
      const overtimePay = employee.overtimeHours * employee.hourlyRate;
      items.push({ type: "ALLOWANCE", amount: overtimePay, description: `Overtime: ${employee.overtimeHours}hrs @ ${employee.hourlyRate}/hr` });
      subjectAllowances += overtimePay;
    }

    // Subject Allowances (Teachers only)
    if (employee.role === "TEACHING_STAFF") {
      for (const rate of employee.subjectRates) {
        subjectAllowances += rate.amount;
        items.push({ type: "ALLOWANCE", amount: rate.amount, description: `Subject Rate: ${rate.course.name} (${rate.type})` });
      }
    }

    // Deductions (Unapproved Leaves example)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const unapprovedLeaves = await prisma.leaveRequest.count({
      where: {
        userId: employee.id,
        status: { in: ["PENDING", "REJECTED"] },
        startDate: { gte: startDate, lte: endDate }
      }
    });

    let deductions = 0;
    if (unapprovedLeaves > 0) {
      const dailyRate = employee.baseSalary / 30;
      deductions = unapprovedLeaves * dailyRate;
      items.push({ type: "DEDUCTION", amount: deductions, description: `${unapprovedLeaves} Unapproved Leave(s) Penalty` });
    }

    const netAmount = Math.max(0, employee.baseSalary + subjectAllowances - deductions);

    await prisma.$transaction([
      prisma.employeePayroll.create({
        data: {
          employeeId: employee.id,
          month,
          year,
          baseSalary: employee.baseSalary,
          hourlyRate: employee.hourlyRate,
          overtimeHours: employee.overtimeHours,
          subjectAllowances,
          deductions,
          netAmount,
          status: "DRAFT",
          items: { create: items }
        }
      }),
      prisma.user.update({
        where: { id: employee.id },
        data: { overtimeHours: 0 } // Reset unprocessed overtime
      })
    ]);

    generatedCount++;
  }

  revalidatePath("/admin/payroll");
  return generatedCount;
}

export async function approvePayroll(payrollId: string, action: "APPROVE" | "DISBURSE") {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEAD_ADMIN") {
    throw new Error("Only Head Admin can authorize payroll disbursement");
  }

  const data: any = {
    status: action === "APPROVE" ? "APPROVED" : "DISBURSED",
    approvedById: session.user.id
  };
  
  if (action === "DISBURSE") {
    data.disbursedAt = new Date();
  }

  await prisma.employeePayroll.update({
    where: { id: payrollId },
    data
  });

  revalidatePath("/admin/payroll");
}
