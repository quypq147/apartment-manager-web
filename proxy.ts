import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const userId = request.cookies.get("user_id");
  const userRole = request.cookies.get("user_role");
  const { pathname } = request.nextUrl;

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
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/tenant") && userRole.value !== "TENANT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && userRole.value !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
