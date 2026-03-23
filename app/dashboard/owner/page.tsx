"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, PieChart, DollarSign, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import {
  getInvoices,
  getProperties,
  getTenants,
  getDashboardStats,
  type OwnerInvoice,
  type OwnerProperty,
  type OwnerTenantContract,
  type OwnerDashboardStats,
} from "@/lib/api/owner";
import { RevenueChart, RoomOccupancyChart } from "@/components/dashboard-charts";
import { AIOverview } from "@/components/dashboard/ai-overview";

const currency = new Intl.NumberFormat("vi-VN");

function getPaid(invoice: OwnerInvoice) {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export default function OwnerDashboard() {
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

  const stats = useMemo(() => {
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
      (sum, property) =>
        sum + property.rooms.filter((room) => room.status === "RENTED").length,
      0
    );
    const availableRooms = properties.reduce(
      (sum, property) =>
        sum + property.rooms.filter((room) => room.status === "AVAILABLE").length,
      0
    );
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    const unpaidInvoices = invoices.filter(
      (invoice) => invoice.status === "UNPAID" || invoice.status === "PARTIAL" || invoice.status === "OVERDUE"
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

  const expiringContracts = useMemo(() => {
    const today = new Date();

    return contracts
      .filter((contract) => contract.status === "ACTIVE" && contract.endDate)
      .map((contract) => {
        const endDate = new Date(contract.endDate as string);
        const diff = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...contract,
          daysLeft: diff,
        };
      })
      .filter((contract) => contract.daysLeft >= 0 && contract.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [contracts]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng Quan</h1>
          <p className="text-muted-foreground mt-1">Theo dõi tình hình hoạt động các khu trọ của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/owner/invoices"
            className="px-4 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-muted font-medium transition-colors"
          >
            Ghi điện nước
          </Link>
          <Link
            href="/dashboard/owner/invoices"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
          >
            + Tạo hóa đơn mới
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && <AIOverview stats={stats} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Tổng số phòng</h3>
            <p className="text-3xl font-bold mt-2 text-foreground">{stats.totalRooms}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {stats.rentedRooms} đã thuê, {stats.availableRooms} trống
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Tỷ lệ lấp đầy</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.occupancyRate}%</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {stats.rentedRooms}/{stats.totalRooms} phòng đang thuê
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Chờ thu (Tất cả)</h3>
            <p className="text-3xl font-bold mt-2 text-amber-600">{currency.format(stats.pendingRevenue)}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{stats.overdueInvoices.filter((inv) => inv.daysOverdue > 0).length} quá hạn</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Đã thu</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{currency.format(stats.actualRevenue)}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          {dashboardStats && dashboardStats.revenueChartData?.length > 0 ? (
            <RevenueChart data={dashboardStats.revenueChartData} />
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu</p>
          )}
        </div>

        {/* Room Occupancy Chart */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <RoomOccupancyChart
            totalRooms={stats.totalRooms}
            rentedRooms={stats.rentedRooms}
            availableRooms={stats.availableRooms}
            occupancyRate={stats.occupancyRate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Invoices */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg text-foreground">Hóa đơn quá hạn</h3>
            </div>
            <Link href="/dashboard/owner/invoices" className="text-sm text-blue-600 font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardStats && dashboardStats.overdueInvoices.filter(inv => inv.daysOverdue > 0).length > 0 ? (
                dashboardStats.overdueInvoices.filter(inv => inv.daysOverdue > 0).slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                        {invoice.roomName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{invoice.tenantName}</p>
                        <p className="text-sm text-red-600 font-medium">{invoice.roomName} - Quá hạn {invoice.daysOverdue} ngày</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{currency.format(invoice.amount)} đ</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Không có hóa đơn quá hạn.</p>
              )}
            </div>
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg text-foreground">Hóa đơn cần thu</h3>
            <Link href="/dashboard/owner/invoices" className="text-sm text-blue-600 font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {invoices.filter(inv => inv.status === "UNPAID" || inv.status === "PARTIAL").slice(0, 5).map((invoice) => {
                const remaining = Math.max(invoice.totalAmount - getPaid(invoice), 0);

                return (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                        {invoice.contract.room.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{invoice.contract.tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{currency.format(remaining)} đ</p>
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md mt-1">
                        {invoice.status === "PARTIAL" ? "Đóng thiếu" : "Chưa thanh toán"}
                      </span>
                      <p className="font-medium text-foreground">{invoice.contract.tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{currency.format(remaining)} đ</p>
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md mt-1">
                        {invoice.status === "PARTIAL" ? "Đóng thiếu" : "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!loading && invoices.filter(inv => inv.status === "UNPAID" || inv.status === "PARTIAL").length === 0 && (
                <p className="text-sm text-muted-foreground">Không có hóa đơn cần thu.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Contracts Section */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-lg text-foreground">Hợp đồng sắp hết hạn</h3>
          <Link href="/dashboard/owner/tenants" className="text-sm text-blue-600 font-medium hover:underline">
            Quản lý
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {expiringContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {contract.room.name}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{contract.tenant.name}</p>
                      <p className="text-sm text-red-500 font-medium">Hết hạn trong {contract.daysLeft} ngày tới</p>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && expiringContracts.length === 0 && (
                <p className="text-sm text-muted-foreground">Không có hợp đồng sắp hết hạn.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
