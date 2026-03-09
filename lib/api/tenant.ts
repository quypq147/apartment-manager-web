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

export function getTenantContracts(userId?: string): Promise<ApiResult<TenantContract[]>> {
  return apiRequest<TenantContract[]>("/api/tenant/contracts", {
    userId,
    role: "TENANT",
  });
}
