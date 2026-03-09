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
      select: { id: true },
    });

    const contractIds = contracts.map((contract) => contract.id);

    if (contractIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        contractId: {
          in: contractIds,
        },
      },
      include: {
        items: {
          include: {
            service: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            paymentDate: true,
          },
          orderBy: [{ paymentDate: "desc" }],
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });

    const data = invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

      return {
        id: invoice.id,
        month: invoice.month,
        year: invoice.year,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate,
        createdDate: invoice.createdAt,
        paidAmount,
        paidDate: invoice.status === "PAID" && invoice.payments[0]
          ? invoice.payments[0].paymentDate
          : null,
        items: invoice.items.map((item) => ({
          id: item.id,
          name: item.service?.name || "Khoản phí",
          quantity: item.quantity,
          unit: item.service?.unit || null,
          amount: item.amount,
        })),
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
    console.error("GET /api/tenant/invoices error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
