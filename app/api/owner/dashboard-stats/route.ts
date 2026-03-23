import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface OwnerDashboardStats {
  totalRooms: number;
  rentedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  expectedRevenue: number;
  actualRevenue: number;
  pendingRevenue: number;
  overdueInvoices: Array<{
    id: string;
    title: string;
    tenantName: string;
    roomName: string;
    amount: number;
    daysOverdue: number;
  }>;
  revenueChartData: Array<{
    month: string;
    expected: number;
    actual: number;
  }>;
}

export async function GET(request: NextRequest) {
  const headers = request.headers;
  const userId = headers.get("x-user-id");
  const userRole = headers.get("x-user-role");

  if (!userId || userRole !== "LANDLORD") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedProperties: {
        include: {
          rooms: {
            include: {
              contracts: {
                include: {
                  invoices: true,
                  tenant: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "LANDLORD") {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const today = new Date();
  const overdueInvoices = [];
  let totalRooms = 0;
  let rentedRooms = 0;
  let availableRooms = 0;
  let expectedRevenue = 0;
  let actualRevenue = 0;
  let pendingRevenue = 0;

  for (const property of user.ownedProperties) {
    for (const room of property.rooms) {
      totalRooms++;

      if (room.status === "RENTED") {
        rentedRooms++;
      } else if (room.status === "AVAILABLE") {
        availableRooms++;
      }

      for (const contract of room.contracts) {
        // Expected revenue: chỉ tính từ Contract ACTIVE (doanh thu kỳ vọng hàng tháng hiện tại)
        if (contract.status === "ACTIVE") {
          expectedRevenue += contract.roomPrice;
        }

        // Actual revenue và overdue invoices: tính TẤT CẢ Invoice bất kể Contract status
        // Vì Invoice đã phát sinh vẫn phải thu tiền dù hợp đồng hết hạn
        for (const invoice of contract.invoices) {
          // Actual revenue (paid amount)
          const paidAmount = await prisma.payment.aggregate({
            where: { invoiceId: invoice.id },
            _sum: { amount: true },
          });
          actualRevenue += paidAmount._sum.amount || 0;

          // Check for overdue invoices
          if (invoice.dueDate && invoice.status !== "PAID") {
            const dueDate = new Date(invoice.dueDate);
            const daysOverdue = Math.floor(
              (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysOverdue > 0) {
              const paid = paidAmount._sum.amount || 0;
              const remaining = Math.max(invoice.totalAmount - paid, 0);

              overdueInvoices.push({
                id: invoice.id,
                title: invoice.title,
                tenantName: contract.tenant.name,
                roomName: room.name,
                amount: remaining,
                daysOverdue,
              });
            } else {
              pendingRevenue += Math.max(invoice.totalAmount - (paidAmount._sum.amount || 0), 0);
            }
          }
        }
      }
    }
  }

  const occupancyRate =
    totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  // Sort overdue invoices by days overdue (descending)
  overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Get revenue data for the last 6 months
  const revenueChartData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthName = date.toLocaleDateString("vi-VN", { month: "short" });
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let monthExpected = 0;
    let monthActual = 0;

    for (const property of user.ownedProperties) {
      for (const room of property.rooms) {
        for (const contract of room.contracts) {
          const invoicesInMonth = contract.invoices.filter(
            (inv: typeof contract.invoices[0]) => inv.month === month && inv.year === year
          );

          if (invoicesInMonth.length > 0) {
            // Expected: chỉ tính Contract ACTIVE trong tháng đó
            if (contract.status === "ACTIVE") {
              monthExpected += contract.roomPrice;
            }

            // Actual: tính TẤT CẢ Invoice trong tháng đó (kể cả Contract đã EXPIRED)
            for (const invoice of invoicesInMonth) {
              const paidAmount = await prisma.payment.aggregate({
                where: { invoiceId: invoice.id },
                _sum: { amount: true },
              });
              monthActual += paidAmount._sum.amount || 0;
            }
          }
        }
      }
    }

    revenueChartData.push({
      month: monthName,
      expected: monthExpected,
      actual: monthActual,
    });
  }

  const stats: OwnerDashboardStats = {
    totalRooms,
    rentedRooms,
    availableRooms,
    occupancyRate,
    expectedRevenue,
    actualRevenue,
    pendingRevenue,
    overdueInvoices: overdueInvoices.slice(0, 10),
    revenueChartData,
  };

  return NextResponse.json({
    success: true,
    data: stats,
  });
}
