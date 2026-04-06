import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    invoiceId: string;
  }>;
}

interface UpdateInvoiceBody {
  title?: string;
  dueDate?: string | null;
  status?: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || !userRole || !["LANDLORD", "TENANT", "ADMIN"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { invoiceId } = await context.params;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const where =
      userRole === "LANDLORD"
        ? {
            id: invoiceId,
            contract: {
              room: {
                property: {
                  landlordId: userId,
                },
              },
            },
          }
        : userRole === "TENANT"
          ? {
              id: invoiceId,
              contract: {
                tenantId: userId,
              },
            }
          : { id: invoiceId };

    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        contract: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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
          },
        },
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
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...invoice,
          paidAmount,
          remainingAmount: Math.max(invoice.totalAmount - paidAmount, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/invoices/[invoiceId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { invoiceId } = await context.params;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateInvoiceBody;
    const nextTitle = body.title?.trim();
    const hasStatus = typeof body.status === "string";
    const hasTitle = typeof nextTitle === "string";
    const hasDueDate = body.dueDate !== undefined;

    if (!hasStatus && !hasTitle && !hasDueDate) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    if (hasStatus && !["UNPAID", "PARTIAL", "PAID", "OVERDUE"].includes(body.status!)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const parsedDueDate =
      body.dueDate === null
        ? null
        : typeof body.dueDate === "string"
          ? new Date(body.dueDate)
          : undefined;

    if (
      parsedDueDate !== undefined &&
      parsedDueDate !== null &&
      Number.isNaN(parsedDueDate.getTime())
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid dueDate" },
        { status: 400 }
      );
    }

    const ownedInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        contract: {
          room: {
            property: {
              landlordId: userId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!ownedInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(hasTitle ? { title: nextTitle || undefined } : {}),
        ...(hasStatus ? { status: body.status } : {}),
        ...(hasDueDate ? { dueDate: parsedDueDate ?? null } : {}),
      },
      include: {
        contract: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    const paidAmount = updated.payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json(
      {
        success: true,
        message: "Invoice updated successfully",
        data: {
          ...updated,
          paidAmount,
          remainingAmount: Math.max(updated.totalAmount - paidAmount, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/invoices/[invoiceId] error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
