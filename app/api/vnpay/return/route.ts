import { NextRequest, NextResponse } from "next/server";
import { buildVnpayQuery, generateVnpaySignature, sortObject } from "@/lib/vnpay";
import prisma from "@/lib/prisma";

function redirectWith302(url: URL) {
  return NextResponse.redirect(url, { status: 302 });
}

function extractInvoiceIdFromTxnRef(txnRef: string | null) {
  if (!txnRef) {
    return "";
  }

  const separatorIndex = txnRef.lastIndexOf("_");
  if (separatorIndex === -1) {
    return txnRef;
  }

  return txnRef.slice(0, separatorIndex);
}

export async function GET(request: NextRequest) {
  const allParams: Record<string, string> = {};
  const vnpParams: Record<string, string> = {};

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    allParams[key] = value;
    if (
      key.startsWith("vnp_") &&
      key !== "vnp_SecureHash" &&
      key !== "vnp_SecureHashType"
    ) {
      vnpParams[key] = value;
    }
  }

  const secureHash = allParams.vnp_SecureHash;

  const responseCode = vnpParams.vnp_ResponseCode ?? "99";
  const txnRef = vnpParams.vnp_TxnRef ?? null;
  const invoiceId = extractInvoiceIdFromTxnRef(txnRef);
  const paidAmount = Number(vnpParams.vnp_Amount) / 100;
  const redirectTarget = allParams.redirectTo;

  const targetPath = redirectTarget === "dashboard" ? "/dashboard/tenant" : "/dashboard/tenant/invoices";
  const targetUrl = new URL(targetPath, request.nextUrl.origin);

  if (!secureHash || !process.env.VNPAY_HASH_SECRET) {
    targetUrl.searchParams.set("payment", "failed");
    targetUrl.searchParams.set("code", "97");
    if (invoiceId) {
      targetUrl.searchParams.set("invoiceId", invoiceId);
    }

    return redirectWith302(targetUrl);
  }

  const sortedParams = sortObject(vnpParams);
  const signData = buildVnpayQuery(sortedParams);
  const expectedHash = generateVnpaySignature(signData, process.env.VNPAY_HASH_SECRET);

  if (secureHash !== expectedHash) {
    targetUrl.searchParams.set("payment", "failed");
    targetUrl.searchParams.set("code", "97");
    if (invoiceId) {
      targetUrl.searchParams.set("invoiceId", invoiceId);
    }

    return redirectWith302(targetUrl);
  }

  if (responseCode === "00" && txnRef && invoiceId && !Number.isNaN(paidAmount) && paidAmount > 0) {
    try {
      const existingPayment = await prisma.payment.findFirst({
        where: { reference: txnRef },
        select: { id: true },
      });

      if (!existingPayment) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          select: {
            id: true,
            totalAmount: true,
          },
        });

        if (!invoice) {
          targetUrl.searchParams.set("payment", "failed");
          targetUrl.searchParams.set("code", "01");
          targetUrl.searchParams.set("invoiceId", invoiceId);
          return redirectWith302(targetUrl);
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
      }
    } catch (error) {
      console.error("GET /api/vnpay/return error", error);
      targetUrl.searchParams.set("payment", "failed");
      targetUrl.searchParams.set("code", "99");
      if (invoiceId) {
        targetUrl.searchParams.set("invoiceId", invoiceId);
      }

      return redirectWith302(targetUrl);
    }
  }

  targetUrl.searchParams.set("payment", responseCode === "00" ? "success" : "failed");
  targetUrl.searchParams.set("code", responseCode);
  if (invoiceId) {
    targetUrl.searchParams.set("invoiceId", invoiceId);
  }

  return redirectWith302(targetUrl);
}
