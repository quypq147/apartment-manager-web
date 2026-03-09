import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const headers = request.headers;
  const userId = headers.get("x-user-id");
  const userRole = headers.get("x-user-role");

  if (!userId || userRole !== "TENANT") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contracts: {
        include: {
          room: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "TENANT") {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const notifications = [];
  const today = new Date();

  // Check for invoices due soon
  for (const contract of user.contracts) {
    if (contract.status !== "ACTIVE") continue;

    const invoices = await prisma.invoice.findMany({
      where: { contractId: contract.id },
      orderBy: { dueDate: "desc" },
      take: 3,
    });

    for (const invoice of invoices) {
      if (invoice.status === "PAID") continue;

      if (invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Invoice overdue
        if (daysUntilDue < 0) {
          notifications.push({
            id: `invoice_overdue_${invoice.id}`,
            type: "invoice_overdue" as const,
            title: "Hóa đơn quá hạn",
            message: `Hóa đơn tháng ${invoice.month}/${invoice.year} tại ${contract.room.name} đã quá hạn thanh toán.`,
            dueDate: invoice.dueDate.toISOString(),
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        // Invoice due in next 7 days
        else if (daysUntilDue <= 7 && daysUntilDue > 0) {
          notifications.push({
            id: `invoice_due_${invoice.id}`,
            type: "invoice_due" as const,
            title: "Sắp hết hạn thanh toán",
            message: `Hóa đơn tháng ${invoice.month}/${invoice.year} sẽ hết hạn thanh toán trong ${daysUntilDue} ngày.`,
            dueDate: invoice.dueDate.toISOString(),
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Check for expiring contracts
    if (contract.endDate && contract.status === "ACTIVE") {
      const endDate = new Date(contract.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        notifications.push({
          id: `contract_expiring_${contract.id}`,
          type: "contract_expiring" as const,
          title: "Hợp đồng sắp hết hạn",
          message: `Hợp đồng tại ${contract.room.name} sẽ hết hạn trong ${daysUntilExpiry} ngày. Vui lòng liên hệ chủ trọ để gia hạn.`,
          expiryDate: contract.endDate.toISOString(),
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: notifications.slice(0, 10), // Return top 10 notifications
  });
}
