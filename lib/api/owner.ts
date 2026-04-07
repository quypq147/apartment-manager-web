import { apiRequest, type ApiResult } from "@/lib/api/http";

export interface OwnerRoom {
  id: string;
  name: string;
  price: number;
  area: number | null;
  capacity: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  propertyId: string;
}

export interface OwnerProperty {
  id: string;
  name: string;
  address: string;
  description: string | null;
  rooms: OwnerRoom[];
}

export interface OwnerTenantContract {
  id: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cccd: string | null;
  };
  room: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface OwnerInvoice {
  id: string;
  title: string;
  month: number;
  year: number;
  totalAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  contract: {
    tenant: {
      name: string;
    };
    room: {
      name: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
  }>;
}

export interface OwnerService {
  id: string;
  name: string;
  unit: string;
  price: number;
  isMetered: boolean;
  propertyId: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
}

export interface PayInvoiceResult {
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
    }>;
  };
}

export interface CreatePropertyPayload {
  name: string;
  address: string;
  description?: string;
}

export interface CreateRoomPayload {
  name: string;
  price: number;
  capacity: number;
  area?: number;
  serviceIds?: string[];
}

export interface CreateInvoiceItemPayload {
  serviceId: string;
  quantity: number;
  unitPrice?: number;
  oldIndicator?: number;
  newIndicator?: number;
}

export interface CreateInvoicePayload {
  contractId: string;
  month: number;
  year: number;
  title?: string;
  dueDate?: string;
  items: CreateInvoiceItemPayload[];
}

export interface CreateServicePayload {
  propertyId: string;
  name: string;
  unit: string;
  price: number;
  isMetered?: boolean;
}

export interface UpdateServicePayload {
  name: string;
  unit: string;
  price: number;
  isMetered?: boolean;
}

export interface CreateContractPayload {
  roomId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  tenantCccd?: string;
  tenantPassword?: string;
  deposit: number;
  roomPrice?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface OwnerDashboardStats {
  totalRooms: number;
  rentedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  expectedRevenue: number;
  actualRevenue: number;
  pendingRevenue: number;
  overdueInvoices: Array<{
    id: string;
    title: string;
    tenantName: string;
    roomName: string;
    amount: number;
    daysOverdue: number;
  }>;
  revenueChartData: Array<{
    month: string;
    expected: number;
    actual: number;
  }>;
}

export function getProperties(userId?: string): Promise<ApiResult<OwnerProperty[]>> {
  return apiRequest<OwnerProperty[]>("/api/properties", { userId });
}

export function getTenants(userId?: string): Promise<ApiResult<OwnerTenantContract[]>> {
  return apiRequest<OwnerTenantContract[]>("/api/tenants", { userId });
}

export function getInvoices(params?: {
  userId?: string;
  month?: number;
  year?: number;
}): Promise<ApiResult<OwnerInvoice[]>> {
  const search = new URLSearchParams();

  if (params?.month) {
    search.set("month", String(params.month));
  }

  if (params?.year) {
    search.set("year", String(params.year));
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest<OwnerInvoice[]>(`/api/invoices${suffix}`, {
    userId: params?.userId,
  });
}

export function getDashboardStats(userId?: string): Promise<ApiResult<OwnerDashboardStats>> {
  return apiRequest<OwnerDashboardStats>("/api/owner/dashboard-stats", {
    userId,
  });
}

export function payInvoice(
  invoiceId: string,
  amount: number,
  userId?: string
): Promise<ApiResult<PayInvoiceResult>> {
  return apiRequest<PayInvoiceResult>(`/api/invoices/${invoiceId}/pay`, {
    method: "POST",
    userId,
    body: {
      amount,
      paymentMethod: "CASH",
    },
  });
}

export function createProperty(
  payload: CreatePropertyPayload,
  userId?: string
): Promise<ApiResult<OwnerProperty>> {
  return apiRequest<OwnerProperty>("/api/properties", {
    method: "POST",
    userId,
    body: payload,
  });
}

export function deleteProperty(
  propertyId: string,
  userId?: string
): Promise<ApiResult<unknown>> {
  return apiRequest<unknown>(`/api/properties/${propertyId}`, {
    method: "DELETE",
    userId,
  });
}

export function createRoom(
  propertyId: string,
  payload: CreateRoomPayload,
  userId?: string
): Promise<ApiResult<OwnerRoom>> {
  return apiRequest<OwnerRoom>(`/api/properties/${propertyId}/rooms`, {
    method: "POST",
    userId,
    body: payload,
  });
}

export function createInvoice(
  payload: CreateInvoicePayload,
  userId?: string
): Promise<ApiResult<OwnerInvoice>> {
  return apiRequest<OwnerInvoice>("/api/invoices", {
    method: "POST",
    userId,
    body: payload,
  });
}

export function createContract(
  payload: CreateContractPayload,
  userId?: string
): Promise<ApiResult<OwnerTenantContract>> {
  return apiRequest<OwnerTenantContract>("/api/contracts", {
    method: "POST",
    userId,
    body: payload,
  });
}

export function getServices(params?: {
  userId?: string;
  propertyId?: string;
}): Promise<ApiResult<OwnerService[]>> {
  const search = new URLSearchParams();

  if (params?.propertyId) {
    search.set("propertyId", params.propertyId);
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest<OwnerService[]>(`/api/services${suffix}`, {
    userId: params?.userId,
  });
}

export function createService(
  payload: CreateServicePayload,
  userId?: string
): Promise<ApiResult<OwnerService>> {
  return apiRequest<OwnerService>("/api/services", {
    method: "POST",
    userId,
    body: payload,
  });
}

export function updateService(
  serviceId: string,
  payload: UpdateServicePayload,
  userId?: string
): Promise<ApiResult<OwnerService>> {
  return apiRequest<OwnerService>(`/api/services/${serviceId}`, {
    method: "PUT",
    userId,
    body: payload,
  });
}

export function deleteService(
  serviceId: string,
  userId?: string
): Promise<ApiResult<unknown>> {
  return apiRequest<unknown>(`/api/services/${serviceId}`, {
    method: "DELETE",
    userId,
  });
}

export function renewContract(
  contractId: string,
  newEndDate: string,
  userId?: string
): Promise<ApiResult<unknown>> {
  return apiRequest<unknown>(`/api/contracts/${contractId}`, {
    method: "PATCH",
    userId,
    body: {
      newEndDate,
    },
  });
}
