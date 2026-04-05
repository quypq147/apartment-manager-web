"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDashboardStats,
  getInvoices,
  getProperties,
  getTenants,
  type OwnerDashboardStats,
  type OwnerInvoice,
  type OwnerProperty,
  type OwnerTenantContract,
} from "@/lib/api/owner";

export type OwnerDashboardViewStats = {
  totalRooms: number;
  rentedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  expectedRevenue: number;
  actualRevenue: number;
  pendingRevenue: number;
  overdueInvoices: OwnerDashboardStats["overdueInvoices"];
};

export type OwnerExpiringContract = OwnerTenantContract & {
  daysLeft: number;
};

export type OwnerUnpaidInvoiceSummary = {
  id: string;
  tenantName: string;
  title: string;
  roomInitial: string;
  remainingAmount: number;
  status: OwnerInvoice["status"];
};

function getPaid(invoice: OwnerInvoice) {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function useOwnerDashboard() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [contracts, setContracts] = useState<OwnerTenantContract[]>([]);
  const [invoices, setInvoices] = useState<OwnerInvoice[]>([]);
  const [dashboardStats, setDashboardStats] = useState<OwnerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();

    const load = async () => {
      setLoading(true);
      const [propertiesRes, tenantsRes, invoicesRes, statsRes] = await Promise.all([
        getProperties(),
        getTenants(),
        getInvoices({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getDashboardStats(),
      ]);

      if (!propertiesRes.success || !tenantsRes.success || !invoicesRes.success) {
        setError("Không thể tải dữ liệu tổng quan");
        setLoading(false);
        return;
      }

      setProperties(propertiesRes.data ?? []);
      setContracts(tenantsRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);

      if (statsRes.success) {
        setDashboardStats(statsRes.data ?? null);
      }

      setError(null);
      setLoading(false);
    };

    void load();
  }, []);

  const stats = useMemo<OwnerDashboardViewStats>(() => {
    if (dashboardStats) {
      return {
        totalRooms: dashboardStats.totalRooms,
        rentedRooms: dashboardStats.rentedRooms,
        availableRooms: dashboardStats.availableRooms,
        occupancyRate: dashboardStats.occupancyRate,
        expectedRevenue: dashboardStats.expectedRevenue,
        actualRevenue: dashboardStats.actualRevenue,
        pendingRevenue: dashboardStats.pendingRevenue,
        overdueInvoices: dashboardStats.overdueInvoices,
      };
    }

    const totalRooms = properties.reduce((sum, property) => sum + property.rooms.length, 0);
    const rentedRooms = properties.reduce(
      (sum, property) => sum + property.rooms.filter((room) => room.status === "RENTED").length,
      0
    );
    const availableRooms = properties.reduce(
      (sum, property) => sum + property.rooms.filter((room) => room.status === "AVAILABLE").length,
      0
    );
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    const unpaidInvoices = invoices.filter(
      (invoice) =>
        invoice.status === "UNPAID" ||
        invoice.status === "PARTIAL" ||
        invoice.status === "OVERDUE"
    );

    const pendingRevenue = unpaidInvoices.reduce(
      (sum, invoice) => sum + Math.max(invoice.totalAmount - getPaid(invoice), 0),
      0
    );

    const actualRevenue = invoices.reduce((sum, invoice) => sum + getPaid(invoice), 0);

    return {
      totalRooms,
      rentedRooms,
      availableRooms,
      occupancyRate,
      expectedRevenue: 0,
      actualRevenue,
      pendingRevenue,
      overdueInvoices: [],
    };
  }, [invoices, properties, dashboardStats]);

  const expiringContracts = useMemo<OwnerExpiringContract[]>(() => {
    const today = new Date();

    return contracts
      .filter((contract) => contract.status === "ACTIVE" && contract.endDate)
      .map((contract) => {
        const endDate = new Date(contract.endDate as string);
        const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...contract,
          daysLeft: diff,
        };
      })
      .filter((contract) => contract.daysLeft >= 0 && contract.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [contracts]);

  const unpaidInvoices = useMemo<OwnerUnpaidInvoiceSummary[]>(() => {
    return invoices
      .filter((invoice) => invoice.status === "UNPAID" || invoice.status === "PARTIAL")
      .slice(0, 5)
      .map((invoice) => ({
        id: invoice.id,
        tenantName: invoice.contract.tenant.name,
        title: invoice.title,
        roomInitial: invoice.contract.room.name[0],
        remainingAmount: Math.max(invoice.totalAmount - getPaid(invoice), 0),
        status: invoice.status,
      }));
  }, [invoices]);

  return {
    loading,
    error,
    dashboardStats,
    stats,
    expiringContracts,
    unpaidInvoices,
  };
}
