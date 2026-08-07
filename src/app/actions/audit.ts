"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";



// Instead of directly updating/deleting critical records, call this function
export async function requestAuditAction(
  actionType: "DELETE" | "MODIFY",
  entityType: "STUDENT" | "GRADE" | "ATTENDANCE" | "INVOICE",
  entityId: string,
  reason: string,
  originalData?: any,
  proposedData?: any
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // HEAD_ADMIN can bypass audit completely
  if (session.user.role === "HEAD_ADMIN") {
    throw new Error("Head Admins should bypass the audit queue and execute directly.");
  }

  await prisma.auditTicket.create({
    data: {
      actionType,
      entityType,
      entityId,
      reason,
      requestedById: session.user.id,
      originalData: originalData ? JSON.stringify(originalData) : null,
      proposedData: proposedData ? JSON.stringify(proposedData) : null,
      status: "PENDING_HEAD_ADMIN_APPROVAL"
    }
  });
}

// Head Admin resolves the ticket
export async function resolveAuditTicket(ticketId: string, status: "APPROVED" | "REJECTED", rejectedReason?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEAD_ADMIN") {
    throw new Error("Only Head Admin can resolve audit tickets.");
  }

  const ticket = await prisma.auditTicket.findUniqueOrThrow({ where: { id: ticketId } });

  if (status === "APPROVED") {
    // Dynamically apply the change based on entityType
    if (ticket.actionType === "DELETE") {
      if (ticket.entityType === "STUDENT") await prisma.user.update({ where: { id: ticket.entityId }, data: { deletedAt: new Date() } });
      else if (ticket.entityType === "GRADE") await prisma.testResult.delete({ where: { id: ticket.entityId } });
      else if (ticket.entityType === "ATTENDANCE") await prisma.attendance.delete({ where: { id: ticket.entityId } });
      else if (ticket.entityType === "INVOICE") await prisma.invoice.delete({ where: { id: ticket.entityId } });
    } else if (ticket.actionType === "MODIFY" && ticket.proposedData) {
      const data = JSON.parse(ticket.proposedData);
      if (ticket.entityType === "STUDENT") await prisma.user.update({ where: { id: ticket.entityId }, data });
      else if (ticket.entityType === "GRADE") await prisma.testResult.update({ where: { id: ticket.entityId }, data });
      else if (ticket.entityType === "ATTENDANCE") await prisma.attendance.update({ where: { id: ticket.entityId }, data });
      else if (ticket.entityType === "INVOICE") await prisma.invoice.update({ where: { id: ticket.entityId }, data });
    }
  }

  await prisma.auditTicket.update({
    where: { id: ticketId },
    data: { 
      status, 
      approvedById: session.user.id, 
      approvedAt: new Date(),
      rejectedReason 
    }
  });

  revalidatePath("/dashboard");
}
