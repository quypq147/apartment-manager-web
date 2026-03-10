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

    // Ưu tiên lấy Contract ACTIVE, nếu không có thì lấy EXPIRED gần nhất
    let currentContract = await prisma.contract.findFirst({
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

    // Nếu không có ACTIVE, lấy EXPIRED gần nhất để hiển thị thông tin
    if (!currentContract) {
      currentContract = await prisma.contract.findFirst({
        where: {
          tenantId: userId,
          status: "EXPIRED",
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
        orderBy: [{ endDate: "desc" }],
      });
    }

    if (!currentContract) {
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

    // Lấy TẤT CẢ unpaid/partial invoices từ MỌI contract của tenant
    // Vì Invoice đã phát sinh vẫn phải thanh toán dù hợp đồng hết hạn
    const allContracts = await prisma.contract.findMany({
      where: { tenantId: userId },
      select: { id: true },
    });

    const contractIds = allContracts.map((c) => c.id);

    const invoices = await prisma.invoice.findMany({
      where: {
        contractId: {
          in: contractIds,
        },
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
            name: currentContract.room.name,
            property: currentContract.room.property.name,
            address: currentContract.room.property.address,
            price: currentContract.roomPrice,
            area: currentContract.room.area,
            contractStartDate: currentContract.startDate,
            contractEndDate: currentContract.endDate,
            contractStatus: currentContract.status,
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
