import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Role-based route protection matrix
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard":  ["HEAD_ADMIN"],
  "/admin":      ["HEAD_ADMIN", "ADMIN"],
  "/hod":        ["HEAD_ADMIN", "ADMIN", "HOD"],
  "/teacher":    ["HEAD_ADMIN", "ADMIN", "HOD", "TEACHER"],
  "/student":    ["STUDENT"],
  "/parent":     ["PARENT"],
  // shared pages accessible by most staff
  "/hr":         ["HEAD_ADMIN", "ADMIN", "HOD", "HR"],
  "/finance":    ["HEAD_ADMIN", "ADMIN", "FINANCE"],
  "/reports":    ["HEAD_ADMIN", "ADMIN", "HR", "FINANCE", "HOD"],
  "/settings":   ["HEAD_ADMIN", "ADMIN", "HOD", "TEACHER", "STUDENT", "PARENT", "FINANCE", "HR", "STAFF"],
  "/students":   ["HEAD_ADMIN", "ADMIN", "HOD", "HR", "FINANCE"],
  "/courses":    ["HEAD_ADMIN", "ADMIN", "HOD", "TEACHER"],
};

// After login, redirect user to their portal home
const ROLE_HOME: Record<string, string> = {
  HEAD_ADMIN: "/dashboard",
  ADMIN:      "/admin",
  HOD:        "/hod",
  TEACHER:    "/teacher",
  STUDENT:    "/student",
  PARENT:     "/parent",
  HR:         "/hr/employees",
  FINANCE:    "/finance",
  STAFF:      "/settings",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  let role = (user?.role as string) || ""; if (role === "SUPER_ADMIN") role = "HEAD_ADMIN"; 

  // Pass API routes straight through
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Pass static assets
  if (nextUrl.pathname.startsWith("/_next") || nextUrl.pathname === "/favicon.ico" || nextUrl.pathname.startsWith("/test")) {
    return NextResponse.next();
  }

  // Login page: redirect already-authenticated users to their home
  if (nextUrl.pathname === "/login" || nextUrl.pathname === "/") {
    if (isLoggedIn && role) {
      const home = ROLE_HOME[role] || "/dashboard";
      return NextResponse.redirect(new URL(home, nextUrl));
    }
    return NextResponse.next();
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // HEAD_ADMIN can access everything
  if (role === "HEAD_ADMIN") return NextResponse.next();

  // Check role-based route access
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (nextUrl.pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(role)) {
        const home = ROLE_HOME[role] || "/settings";
        return NextResponse.redirect(new URL(home, nextUrl));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
