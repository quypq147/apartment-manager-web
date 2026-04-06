import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const landlords = await prisma.user.findMany({
      where: { role: "LANDLORD" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            ownedProperties: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const data = landlords.map((landlord) => ({
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: landlord.phone,
      createdAt: landlord.createdAt,
      propertiesCount: landlord._count.ownedProperties,
      status: landlord._count.ownedProperties > 0 ? "ACTIVE" : "PENDING_VERIFICATION",
    }));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/landlords error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
