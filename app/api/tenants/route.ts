import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    const userRole = currentUser?.role;

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contracts = await prisma.contract.findMany({
      where: {
        room: {
          property: {
            landlordId: userId,
          },
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            role: true,
          },
        },
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
        invoices: {
          select: {
            id: true,
            title: true,
            month: true,
            year: true,
            totalAmount: true,
            status: true,
            dueDate: true,
          },
          orderBy: [{ year: "desc" }, { month: "desc" }],
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: contracts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/tenants error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
