import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = request.nextUrl.searchParams.get("propertyId") ?? undefined;

    const rooms = await prisma.room.findMany({
      where: {
        property: {
          landlordId: userId,
        },
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        contracts: {
          select: {
            id: true,
            tenantId: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: [{ propertyId: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: rooms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/rooms error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
