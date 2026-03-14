import { apiRequest, type ApiResult } from "@/lib/api/http";

export interface TenantDashboardInvoice {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  status: "UNPAID" | "PARTIAL";
  dueDate: string | null;
  paidAmount: number;
}

export interface TenantInvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  amount: number;
}

export interface TenantInvoice {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string | null;
  createdDate: string;
  paidAmount: number;
  paidDate: string | null;
  items: TenantInvoiceItem[];
}

export interface TenantPaymentResult {
  payment: {
    id: string;
    amount: number;
    paymentMethod: "CASH" | "BANK_TRANSFER";
    reference: string | null;
    paymentDate?: string;
    invoiceId?: string;
  };
  invoice: {
    id: string;
    totalAmount: number;
    status: "UNPAID" | "PARTIAL" | "PAID";
    paidAmount: number;
    remainingAmount: number;
    payments: Array<{
      id: string;
      amount: number;
      paymentDate?: string;
    }>;
  };
}

export interface TenantContract {
  id: string;
  roomName: string;
  property: string;
  landlord: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  deposit: number;
  roomPrice: number;
  terms: string | null;
}

export interface ContractInvoice {
  id: string;
  title: string;
  month: number;
  year: number;
  totalAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string | null;
  createdAt: string;
  paidAmount: number;
  remainingAmount: number;
  items: Array<{
    id: string;
    type: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    amount: number;
    service: {
      id: string;
      name: string;
      unit: string;
    } | null;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
  }>;
}

export interface ContractDetail {
  id: string;
  deposit: number;
  roomPrice: number;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  notes: string | null;
  createdAt: string;
  room: {
    id: string;
    name: string;
    price: number;
    area: number | null;
    capacity: number;
    property: {
      id: string;
      name: string;
      address: string;
      landlord: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
      };
    };
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cccd: string | null;
  };
  invoices: ContractInvoice[];
}

export interface TenantDashboardData {
  roomInfo: {
    name: string;
    property: string;
    address: string;
    price: number;
    area: number | null;
    contractStartDate: string;
    contractEndDate: string | null;
  } | null;
  unpaidInvoices: TenantDashboardInvoice[];
}

export interface TenantNotification {
  id: string;
  type: "invoice_due" | "contract_expiring" | "invoice_overdue";
  title: string;
  message: string;
  dueDate?: string;
  expiryDate?: string;
  read: boolean;
  createdAt: string;
}

export function getTenantDashboard(userId?: string): Promise<ApiResult<TenantDashboardData>> {
  return apiRequest<TenantDashboardData>("/api/tenant/dashboard", {
    userId,
    role: "TENANT",
  });
}

export function getTenantNotifications(userId?: string): Promise<ApiResult<TenantNotification[]>> {
  return apiRequest<TenantNotification[]>("/api/tenant/notifications", {
    userId,
    role: "TENANT",
  });
}

export function getTenantInvoices(userId?: string): Promise<ApiResult<TenantInvoice[]>> {
  return apiRequest<TenantInvoice[]>("/api/tenant/invoices", {
    userId,
    role: "TENANT",
  });
}

export function payTenantInvoice(
  invoiceId: string,
  amount: number,
  userId?: string,
  reference?: string
): Promise<ApiResult<TenantPaymentResult>> {
  return apiRequest<TenantPaymentResult>(`/api/invoices/${invoiceId}/pay`, {
    method: "POST",
    userId,
    role: "TENANT",
    body: {
      amount,
      paymentMethod: "BANK_TRANSFER",
      reference,
    },
  });
}

export function getTenantContracts(userId?: string): Promise<ApiResult<TenantContract[]>> {
  return apiRequest<TenantContract[]>("/api/tenant/contracts", {
    userId,
    role: "TENANT",
  });
}

export function getContractDetail(contractId: string, userId?: string): Promise<ApiResult<ContractDetail>> {
  return apiRequest<ContractDetail>(`/api/contracts/${contractId}`, {
    userId,
  });
}
