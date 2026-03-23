import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildVnpayQuery, generateVnpaySignature, sortObject } from "@/lib/vnpay";

function extractInvoiceIdFromTxnRef(txnRef: string) {
  const separatorIndex = txnRef.lastIndexOf("_");
  if (separatorIndex === -1) {
    return txnRef;
  }

  return txnRef.slice(0, separatorIndex);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const incomingParams: Record<string, string> = {};
    const vnpParams: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
      incomingParams[key] = value;
      if (
        key.startsWith("vnp_") &&
        key !== "vnp_SecureHash" &&
        key !== "vnp_SecureHashType"
      ) {
        vnpParams[key] = value;
      }
    }

    const secureHash = incomingParams.vnp_SecureHash;

    if (!secureHash) {
      return NextResponse.json({ RspCode: "97", Message: "Checksum failed" });
    }

    const secretKey = process.env.VNPAY_HASH_SECRET;
    if (!secretKey) {
      return NextResponse.json({ RspCode: "99", Message: "Missing secret key" });
    }

    const sortedParams = sortObject(vnpParams);
    const signData = buildVnpayQuery(sortedParams);
    const expectedHash = generateVnpaySignature(signData, secretKey);

    if (secureHash !== expectedHash) {
      return NextResponse.json({ RspCode: "97", Message: "Checksum failed" });
    }

    const txnRef = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const paidAmount = Number(vnpParams.vnp_Amount) / 100;

    if (!txnRef || Number.isNaN(paidAmount) || paidAmount <= 0) {
      return NextResponse.json({ RspCode: "99", Message: "Invalid payload" });
    }

    const invoiceId = extractInvoiceIdFromTxnRef(txnRef);

    const existingPayment = await prisma.payment.findFirst({
      where: { reference: txnRef },
      select: { id: true },
    });

    if (existingPayment) {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        totalAmount: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    if (responseCode !== "00") {
      return NextResponse.json({ RspCode: "00", Message: "Payment failed" });
    }

    await prisma.$transaction(async (tx) => {
      const paymentAggregate = await tx.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true },
      });

      const paidBefore = paymentAggregate._sum.amount ?? 0;
      const remainingAmount = invoice.totalAmount - paidBefore;

      if (paidAmount > remainingAmount) {
        throw new Error("AMOUNT_EXCEEDS_REMAINING");
      }

      await tx.payment.create({
        data: {
          invoiceId,
          amount: paidAmount,
          paymentMethod: "VNPAY",
          reference: txnRef,
        },
      });

      const paidAfter = paidBefore + paidAmount;

      let nextStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
      if (paidAfter >= invoice.totalAmount) {
        nextStatus = "PAID";
      } else if (paidAfter > 0) {
        nextStatus = "PARTIAL";
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: nextStatus },
      });
    });

    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    if (error instanceof Error && error.message === "AMOUNT_EXCEEDS_REMAINING") {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    console.error("GET /api/vnpay/ipn error", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
