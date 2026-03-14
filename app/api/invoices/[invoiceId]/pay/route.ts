import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface PayInvoiceBody {
  amount: number;
  paymentMethod?: "CASH" | "BANK_TRANSFER";
  reference?: string;
}

interface RouteContext {
  params: {
    invoiceId: string;
  } | Promise<{
    invoiceId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || !userRole || !["LANDLORD", "TENANT"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(context.params);
    const { invoiceId } = resolvedParams;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as PayInvoiceBody;
    const { amount, paymentMethod = "CASH", reference } = body;

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!["CASH", "BANK_TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Invalid paymentMethod" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoiceWhere =
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
          : {
              id: invoiceId,
              contract: {
                tenantId: userId,
              },
            };

      const invoice = await tx.invoice.findFirst({
        where: invoiceWhere,
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      });

      if (!invoice) {
        throw new Error("INVOICE_NOT_FOUND");
      }

      const paymentAggregate = await tx.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true },
      });

      const paidBefore = paymentAggregate._sum.amount ?? 0;
      const remainingBefore = invoice.totalAmount - paidBefore;

      if (amount > remainingBefore) {
        throw new Error("AMOUNT_EXCEEDS_REMAINING");
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod,
          reference: reference?.trim() || null,
        },
      });

      const paidAfter = paidBefore + amount;
      let nextStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

      if (paidAfter >= invoice.totalAmount) {
        nextStatus = "PAID";
      } else if (paidAfter > 0) {
        nextStatus = "PARTIAL";
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: nextStatus },
        include: {
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
      });

      return {
        payment,
        invoice: {
          id: updatedInvoice.id,
          totalAmount: updatedInvoice.totalAmount,
          status: updatedInvoice.status,
          paidAmount: paidAfter,
          remainingAmount: Math.max(updatedInvoice.totalAmount - paidAfter, 0),
          payments: updatedInvoice.payments,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment recorded successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVOICE_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Invoice not found" },
          { status: 400 }
        );
      }

      if (error.message === "AMOUNT_EXCEEDS_REMAINING") {
        return NextResponse.json(
          {
            success: false,
            error: "amount exceeds remaining invoice balance",
          },
          { status: 400 }
        );
      }
    }

    console.error("POST /api/invoices/[invoiceId]/pay error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
