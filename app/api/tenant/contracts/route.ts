import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "TENANT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contracts = await prisma.contract.findMany({
      where: {
        tenantId: userId,
      },
      include: {
        room: {
          include: {
            property: {
              include: {
                landlord: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const data = contracts.map((contract) => ({
      id: contract.id,
      roomName: contract.room.name,
      property: contract.room.property.name,
      landlord: contract.room.property.landlord.name,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      deposit: contract.deposit,
      roomPrice: contract.roomPrice,
      terms: contract.notes,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/tenant/contracts error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
