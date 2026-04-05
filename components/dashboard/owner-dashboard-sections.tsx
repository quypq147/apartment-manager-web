import Link from "next/link";
import { AlertCircle, AlertTriangle, Building2, DollarSign, PieChart } from "lucide-react";
import type { OwnerDashboardStats } from "@/lib/api/owner";
import { RevenueChart, RoomOccupancyChart } from "@/components/dashboard-charts";
import type {
  OwnerDashboardViewStats,
  OwnerExpiringContract,
  OwnerUnpaidInvoiceSummary,
} from "@/app/dashboard/owner/use-owner-dashboard";

const currency = new Intl.NumberFormat("vi-VN");

type OwnerDashboardHeaderProps = {
  title: string;
  description: string;
};

export function OwnerDashboardHeader({ title, description }: OwnerDashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
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
  );
}

export function OwnerLoadingMessage() {
  return <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>;
}

type OwnerStatusMessageProps = {
  message: string;
};

export function OwnerErrorMessage({ message }: OwnerStatusMessageProps) {
  return <p className="text-sm text-red-600">{message}</p>;
}

type OwnerKpiCardsProps = {
  stats: OwnerDashboardViewStats;
};

export function OwnerKpiCards({ stats }: OwnerKpiCardsProps) {
  return (
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
          <p className="text-sm text-muted-foreground/70 mt-1">
            {stats.overdueInvoices.filter((invoice) => invoice.daysOverdue > 0).length} quá hạn
          </p>
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
  );
}

type OwnerChartsSectionProps = {
  dashboardStats: OwnerDashboardStats | null;
  stats: OwnerDashboardViewStats;
};

export function OwnerChartsSection({ dashboardStats, stats }: OwnerChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        {dashboardStats && dashboardStats.revenueChartData?.length > 0 ? (
          <RevenueChart data={dashboardStats.revenueChartData} />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu</p>
        )}
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <RoomOccupancyChart
          totalRooms={stats.totalRooms}
          rentedRooms={stats.rentedRooms}
          availableRooms={stats.availableRooms}
          occupancyRate={stats.occupancyRate}
        />
      </div>
    </div>
  );
}

type OwnerOverdueInvoicesCardProps = {
  overdueInvoices: OwnerDashboardStats["overdueInvoices"];
};

export function OwnerOverdueInvoicesCard({ overdueInvoices }: OwnerOverdueInvoicesCardProps) {
  const overdueItems = overdueInvoices.filter((invoice) => invoice.daysOverdue > 0).slice(0, 5);

  return (
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
          {overdueItems.length > 0 ? (
            overdueItems.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                    {invoice.roomName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{invoice.tenantName}</p>
                    <p className="text-sm text-red-600 font-medium">
                      {invoice.roomName} - Quá hạn {invoice.daysOverdue} ngày
                    </p>
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
  );
}

type OwnerUnpaidInvoicesCardProps = {
  invoices: OwnerUnpaidInvoiceSummary[];
};

export function OwnerUnpaidInvoicesCard({ invoices }: OwnerUnpaidInvoicesCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-lg text-foreground">Hóa đơn cần thu</h3>
        <Link href="/dashboard/owner/invoices" className="text-sm text-blue-600 font-medium hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  {invoice.roomInitial}
                </div>
                <div>
                  <p className="font-medium text-foreground">{invoice.tenantName}</p>
                  <p className="text-sm text-muted-foreground">{invoice.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">{currency.format(invoice.remainingAmount)} đ</p>
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md mt-1">
                  {invoice.status === "PARTIAL" ? "Đóng thiếu" : "Chưa thanh toán"}
                </span>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">Không có hóa đơn cần thu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

type OwnerExpiringContractsCardProps = {
  contracts: OwnerExpiringContract[];
};

export function OwnerExpiringContractsCard({ contracts }: OwnerExpiringContractsCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-lg text-foreground">Hợp đồng sắp hết hạn</h3>
        <Link href="/dashboard/owner/tenants" className="text-sm text-blue-600 font-medium hover:underline">
          Quản lý
        </Link>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {contracts.map((contract) => (
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
          {contracts.length === 0 && (
            <p className="text-sm text-muted-foreground">Không có hợp đồng sắp hết hạn.</p>
          )}
        </div>
      </div>
    </div>
  );
}
