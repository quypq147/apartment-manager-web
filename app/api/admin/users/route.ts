import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_ROLES = ["ADMIN", "LANDLORD"] as const;

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roleParam = request.nextUrl.searchParams.get("role");

    if (roleParam && !ALLOWED_ROLES.includes(roleParam as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: roleParam ? (roleParam as "ADMIN" | "LANDLORD") : { in: [...ALLOWED_ROLES] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        landlordApprovalStatus: true,
        createdAt: true,
        _count: {
          select: {
            ownedProperties: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const data = users.map((user) => {
      const landlordStatus =
        user.landlordApprovalStatus ??
        (user._count.ownedProperties > 0 ? "ACTIVE" : "PENDING_VERIFICATION");

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        propertiesCount: user._count.ownedProperties,
        status: user.role === "LANDLORD" ? landlordStatus : "ACTIVE",
      };
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/users error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
