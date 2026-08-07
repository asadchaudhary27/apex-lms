import { auth } from "@/auth";
import { type Session } from "next-auth";

// ─── Role constants ────────────────────────────────────────────
export const ROLES = {
  HEAD_ADMIN: "HEAD_ADMIN",
  ADMIN: "ADMIN",
  HOD: "HOD",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Permission token constants ────────────────────────────────
export const PERMISSIONS = {
  VIEW_FINANCE: "VIEW_FINANCE",
  MANAGE_FINANCE: "MANAGE_FINANCE",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_COURSES: "MANAGE_COURSES",
  MANAGE_LEAVES: "MANAGE_LEAVES",
  MANAGE_TIMETABLE: "MANAGE_TIMETABLE",
  MANAGE_EXAMS: "MANAGE_EXAMS",
  MANAGE_GRADES: "MANAGE_GRADES",
  MANAGE_FEES: "MANAGE_FEES",
  MANAGE_ANNOUNCEMENTS: "MANAGE_ANNOUNCEMENTS",
  REQUEST_DELETION: "REQUEST_DELETION",
  APPROVE_DELETION: "APPROVE_DELETION",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Guards ────────────────────────────────────────────────────

/**
 * Throws if the session user is not one of the given roles.
 * HEAD_ADMIN always passes all role checks.
 */
export function requireRole(
  session: Session | null,
  ...roles: Role[]
) {
  const role = session?.user?.role as Role;
  if (!role) throw new Error("Unauthenticated");
  if (role === ROLES.HEAD_ADMIN) return; // superuser bypass
  if (!roles.includes(role)) throw new Error("Unauthorized: insufficient role");
}

/**
 * Throws if the session user does not have at least one of the given permissions.
 * HEAD_ADMIN always passes.
 */
export function requirePermission(
  session: Session | null,
  ...perms: Permission[]
) {
  const role = session?.user?.role as Role;
  if (!role) throw new Error("Unauthenticated");
  if (role === ROLES.HEAD_ADMIN) return;
  const userPerms: Permission[] = JSON.parse(
    (session?.user as any)?.permissions || "[]"
  );
  const hasAny = perms.some((p) => userPerms.includes(p));
  if (!hasAny)
    throw new Error(
      `Unauthorized: missing permission (${perms.join(" | ")})`
    );
}

/**
 * Returns true if user is HEAD_ADMIN or has the specified permission
 */
export function can(session: Session | null, perm: Permission): boolean {
  const role = session?.user?.role as Role;
  if (role === ROLES.HEAD_ADMIN) return true;
  const userPerms: Permission[] = JSON.parse(
    (session?.user as any)?.permissions || "[]"
  );
  return userPerms.includes(perm);
}

/**
 * Guards a deletion attempt. ADMIN can only REQUEST (not execute).
 * Returns "execute" or "request" to tell the caller what to do.
 */
export function deletionMode(
  session: Session | null
): "execute" | "request" {
  const role = session?.user?.role as Role;
  if (role === ROLES.HEAD_ADMIN) return "execute";
  return "request"; // all other roles must go through approval
}
