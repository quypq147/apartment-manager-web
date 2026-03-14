import prisma from "@/lib/prisma";

type InvoiceReader = {
  invoice: {
    findFirst: (args: {
      where: { id: { startsWith: string } };
      orderBy: { id: "desc" };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

const INVOICE_PREFIX = "inv_manual_";

export async function generateNextInvoiceId(reader: InvoiceReader = prisma): Promise<string> {
  const lastInvoice = await reader.invoice.findFirst({
    where: {
      id: {
        startsWith: INVOICE_PREFIX,
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  if (!lastInvoice) {
    return `${INVOICE_PREFIX}001`;
  }

  const lastNumberStr = lastInvoice.id.replace(INVOICE_PREFIX, "");
  const lastNumber = Number.parseInt(lastNumberStr, 10);

  if (Number.isNaN(lastNumber)) {
    return `${INVOICE_PREFIX}${Date.now()}`;
  }

  return `${INVOICE_PREFIX}${String(lastNumber + 1).padStart(3, "0")}`;
}