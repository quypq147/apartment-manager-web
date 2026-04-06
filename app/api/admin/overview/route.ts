import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type LandlordStatus = "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";

type MonthlyRevenue = {
  amount: number;
};

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

    const [totalLandlords, totalTenants, totalProperties] = await Promise.all([
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.property.count(),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyRevenue = (await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })) as { _sum: MonthlyRevenue };

    const landlords = await prisma.user.findMany({
      where: { role: "LANDLORD" },
      select: {
        id: true,
        landlordApprovalStatus: true,
        _count: {
          select: {
            ownedProperties: true,
          },
        },
      },
    });

    const landlordSummary = landlords.reduce(
      (acc, landlord) => {
        const status =
          (landlord.landlordApprovalStatus as LandlordStatus | null) ??
          (landlord._count.ownedProperties > 0 ? "ACTIVE" : "PENDING_VERIFICATION");

        if (status === "ACTIVE") {
          acc.active += 1;
        } else if (status === "REJECTED") {
          acc.rejected += 1;
        } else {
          acc.pending += 1;
        }

        return acc;
      },
      { pending: 0, active: 0, rejected: 0 }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          kpis: {
            totalLandlords,
            totalTenants,
            totalProperties,
            platformRevenue: monthlyRevenue._sum.amount ?? 0,
          },
          landlordSummary,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/overview error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
