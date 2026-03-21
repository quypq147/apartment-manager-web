import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  buildVnpayQuery,
  formatVnpayDate,
  generateVnpaySignature,
  sortObject,
} from "@/lib/vnpay";

interface RouteContext {
  params:
    | {
        invoiceId: string;
      }
    | Promise<{
        invoiceId: string;
      }>;
}

interface CreateVnpayBody {
  redirectTo?: "dashboard" | "invoices";
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return "127.0.0.1";
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const { invoiceId } = resolvedParams;

    let body: CreateVnpayBody = {};
    try {
      body = (await request.json()) as CreateVnpayBody;
    } catch {
      body = {};
    }

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        contract: { tenantId: userId },
      },
      select: {
        id: true,
        totalAmount: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const paymentAggregate = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    const paidBefore = paymentAggregate._sum.amount ?? 0;
    const remainingAmount = invoice.totalAmount - paidBefore;

    if (remainingAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invoice is already fully paid" },
        { status: 400 }
      );
    }

    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing VNPAY configuration. Required: VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL",
        },
        { status: 500 }
      );
    }

    const now = new Date();
    const createDate = formatVnpayDate(now);
    const orderId = `${invoiceId}_${Date.now()}`;
    const amount = Math.round(remainingAmount * 100);

    const returnUrlObject = new URL(returnUrl);
    if (body.redirectTo === "dashboard") {
      returnUrlObject.searchParams.set("redirectTo", "dashboard");
    }

    const payload = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan hoa don ${invoiceId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrlObject.toString(),
      vnp_IpAddr: getClientIp(request),
      vnp_CreateDate: createDate,
    };

    const sortedParams = sortObject(payload);
    const signData = buildVnpayQuery(sortedParams);
    const secureHash = generateVnpaySignature(signData, secretKey);

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl,
        invoiceId,
        amount: remainingAmount,
        txnRef: orderId,
      },
    });
  } catch (error) {
    console.error("POST /api/invoices/[invoiceId]/vnpay error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
