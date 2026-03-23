const TENANT_MOCK_PAID_INVOICE_IDS_KEY = "tenant_mock_paid_invoice_ids_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getMockPaidInvoiceIds(): string[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(TENANT_MOCK_PAID_INVOICE_IDS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function addMockPaidInvoiceIds(invoiceIds: string[]) {
  if (!canUseStorage() || invoiceIds.length === 0) {
    return;
  }

  const existingIds = getMockPaidInvoiceIds();
  const merged = Array.from(new Set([...existingIds, ...invoiceIds]));
  window.localStorage.setItem(TENANT_MOCK_PAID_INVOICE_IDS_KEY, JSON.stringify(merged));
}
