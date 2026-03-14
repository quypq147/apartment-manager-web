import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: {
    contractId: string;
  };
}

interface AsyncRouteContext {
  params: Promise<{
    contractId: string;
  }>;
}

interface ExtendContractBody {
  newEndDate: string;
}

// GET: Xem chi tiết hợp đồng và tất cả hóa đơn liên quan
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(context.params);
    const { contractId } = resolvedParams;
    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "contractId is required" },
        { status: 400 }
      );
    }

    // Build query based on role
    const whereClause =
      userRole === "LANDLORD"
        ? {
            id: contractId,
            room: {
              property: {
                landlordId: userId,
              },
            },
          }
        : userRole === "TENANT"
          ? {
              id: contractId,
              tenantId: userId,
            }
          : null;

    if (!whereClause) {
      return NextResponse.json(
        { success: false, error: "Invalid user role" },
        { status: 403 }
      );
    }

    const contract = await prisma.contract.findFirst({
      where: whereClause,
      include: {
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
                landlord: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
          },
        },
        invoices: {
          include: {
            items: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    unit: true,
                  },
                },
              },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
          orderBy: [{ year: "desc" }, { month: "desc" }],
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Contract not found" },
        { status: 404 }
      );
    }

    // Calculate payment summary for each invoice
    const invoicesWithPaymentSummary = contract.invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remainingAmount = Math.max(invoice.totalAmount - paidAmount, 0);

      return {
        ...invoice,
        paidAmount,
        remainingAmount,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...contract,
          invoices: invoicesWithPaymentSummary,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/contracts/[contractId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Gia hạn hợp đồng (extend endDate)
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const { contractId } = resolvedParams;
    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "contractId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as ExtendContractBody;
    const { newEndDate } = body;

    if (!newEndDate) {
      return NextResponse.json(
        { success: false, error: "newEndDate is required" },
        { status: 400 }
      );
    }

    const parsedNewEndDate = new Date(newEndDate);
    if (Number.isNaN(parsedNewEndDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid newEndDate" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: {
          id: contractId,
          room: {
            property: {
              landlordId: userId,
            },
          },
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      });

      if (!contract) {
        throw new Error("CONTRACT_NOT_FOUND");
      }

      // Cho phép gia hạn cả ACTIVE và EXPIRED contracts
      if (contract.status === "TERMINATED") {
        throw new Error("CANNOT_EXTEND_TERMINATED");
      }

      // Validate newEndDate phải sau startDate
      if (parsedNewEndDate <= contract.startDate) {
        throw new Error("END_DATE_BEFORE_START");
      }

      // Nếu contract đang EXPIRED, chuyển về ACTIVE khi gia hạn
      const newStatus =
        contract.status === "EXPIRED" ? "ACTIVE" : contract.status;

      return tx.contract.update({
        where: { id: contractId },
        data: {
          endDate: parsedNewEndDate,
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
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
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contract extended successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CONTRACT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Contract not found" },
          { status: 404 }
        );
      }

      if (error.message === "CANNOT_EXTEND_TERMINATED") {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot extend a terminated contract",
          },
          { status: 400 }
        );
      }

      if (error.message === "END_DATE_BEFORE_START") {
        return NextResponse.json(
          {
            success: false,
            error: "End date must be after start date",
          },
          { status: 400 }
        );
      }
    }

    console.error("PATCH /api/contracts/[contractId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
