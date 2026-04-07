import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type LandlordStatus = "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";

const STATUS_VALUES: LandlordStatus[] = [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "REJECTED",
];

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

    const statusParam = request.nextUrl.searchParams.get("status");

    if (statusParam && !STATUS_VALUES.includes(statusParam as LandlordStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
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
        landlordApprovalStatus: true,
        _count: {
          select: {
            ownedProperties: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const data = landlords.map((landlord) => {
      const status =
        (landlord.landlordApprovalStatus as LandlordStatus | null) ??
        (landlord._count.ownedProperties > 0
          ? "ACTIVE"
          : "PENDING_VERIFICATION");

      return {
        id: landlord.id,
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        createdAt: landlord.createdAt,
        propertiesCount: landlord._count.ownedProperties,
        status,
      };
    });

    const filteredData = statusParam
      ? data.filter((landlord) => landlord.status === statusParam)
      : data;

    return NextResponse.json(
      {
        success: true,
        data: filteredData,
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
