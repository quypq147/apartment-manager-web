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

    const activeContract = await prisma.contract.findFirst({
      where: {
        tenantId: userId,
        status: "ACTIVE",
      },
      include: {
        room: {
          include: {
            property: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    if (!activeContract) {
      return NextResponse.json(
        {
          success: true,
          data: {
            roomInfo: null,
            unpaidInvoices: [],
          },
        },
        { status: 200 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        contractId: activeContract.id,
        status: {
          in: ["UNPAID", "PARTIAL"],
        },
      },
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    const unpaidInvoices = invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

      return {
        id: invoice.id,
        month: invoice.month,
        year: invoice.year,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAmount,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          roomInfo: {
            name: activeContract.room.name,
            property: activeContract.room.property.name,
            address: activeContract.room.property.address,
            price: activeContract.roomPrice,
            area: activeContract.room.area,
            contractStartDate: activeContract.startDate,
            contractEndDate: activeContract.endDate,
          },
          unpaidInvoices,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/tenant/dashboard error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
