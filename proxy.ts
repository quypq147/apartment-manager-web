import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const userId = request.cookies.get("user_id");
  const userRole = request.cookies.get("user_role");
  const { pathname } = request.nextUrl;

  const redirectToRoleDashboard = () => {
    if (userRole?.value === "LANDLORD") {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    }

    if (userRole?.value === "TENANT") {
      return NextResponse.redirect(new URL("/dashboard/tenant", request.url));
    }

    if (userRole?.value === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  };

  // Allow public routes
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!userId || !userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check role-based access
    if (pathname.startsWith("/dashboard/owner") && userRole.value !== "LANDLORD") {
      return redirectToRoleDashboard();
    }

    if (pathname.startsWith("/dashboard/tenant") && userRole.value !== "TENANT") {
      return redirectToRoleDashboard();
    }

    if (pathname.startsWith("/dashboard/admin") && userRole.value !== "ADMIN") {
      return redirectToRoleDashboard();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
