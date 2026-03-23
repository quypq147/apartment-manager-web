// app/dashboard/admin/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

export default function AdminDashboard() {
  const [landlordFilter, setLandlordFilter] = useState<string>("pending");

  // Mock data - later replace with actual data from API
  const kpiData = {
    totalLandlords: 45,
    totalTenants: 287,
    totalProperties: 68,
    platformRevenue: 2450000,
  };

  const pendingLandlords = [
    {
      id: "LL001",
      name: "Trần Văn B",
      email: "tranvanb@email.com",
      phone: "0912345678",
      properties: 3,
      createdDate: "2026-03-01",
      status: "PENDING_VERIFICATION",
    },
    {
      id: "LL002",
      name: "Lê Thị C",
      email: "lethic@email.com",
      phone: "0987654321",
      properties: 5,
      createdDate: "2026-02-28",
      status: "PENDING_VERIFICATION",
    },
  ];

  const activeLandlords = [
    {
      id: "LL003",
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      properties: 8,
      tenants: 24,
      monthlyRevenue: 42000000,
      status: "ACTIVE",
      joinDate: "2025-01-15",
    },
    {
      id: "LL004",
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0923456789",
      properties: 4,
      tenants: 12,
      monthlyRevenue: 18500000,
      status: "ACTIVE",
      joinDate: "2025-02-01",
    },
    {
      id: "LL005",
      name: "Huỳnh Văn E",
      email: "huynhvane@email.com",
      phone: "0934567890",
      properties: 6,
      tenants: 18,
      monthlyRevenue: 28900000,
      status: "ACTIVE",
      joinDate: "2024-12-10",
    },
  ];

  const displayLandlords =
    landlordFilter === "pending" ? pendingLandlords : activeLandlords;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng Quan Hệ Thống</h1>
          <p className="text-muted-foreground mt-1">Quản lý toàn bộ nền tảng HomeManager.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - Total Landlords */}
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Tổng số Chủ trọ</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {kpiData.totalLandlords}
            </p>
            <p className="text-sm text-gray-400 mt-1">+5 tuần này</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 - Total Tenants */}
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Tổng số Khách thuê</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {kpiData.totalTenants}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">+18 tuần này</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 - Total Properties */}
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Tổng số Khu trọ</h3>
            <p className="text-3xl font-bold mt-2 text-purple-600">
              {kpiData.totalProperties}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">+3 tuần này</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 - Platform Revenue */}
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Doanh thu tháng này</h3>
            <p className="text-2xl font-bold mt-2 text-amber-600">
              {kpiData.platformRevenue.toLocaleString("vi-VN")} đ
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tính toán từ hoa hồng</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Landlords Management Section */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Quản lý Chủ trọ</h3>
          <Link
            href="/dashboard/admin/landlords"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="p-6 border-b border-border flex gap-4">
          <button
            onClick={() => setLandlordFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              landlordFilter === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-muted text-card-foreground hover:bg-muted/80"
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Chờ xác nhận ({pendingLandlords.length})
          </button>
          <button
            onClick={() => setLandlordFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              landlordFilter === "active"
                ? "bg-green-100 text-green-700"
                : "bg-muted text-card-foreground hover:bg-muted/80"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Đang hoạt động ({activeLandlords.length})
          </button>
        </div>

        {/* Landlords Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Tên Chủ trọ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Số điện thoại
                </th>
                {landlordFilter === "pending" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Ngày đăng ký
                  </th>
                )}
                {landlordFilter === "active" && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                      Khu trọ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                      Khách thuê
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                      Doanh thu
                    </th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayLandlords.length > 0 ? (
                displayLandlords.map((landlord) => (
                  <tr key={landlord.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{landlord.name}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {landlord.email}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {landlord.phone}
                    </td>
                    {landlordFilter === "pending" && (
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {"createdDate" in landlord ? landlord.createdDate : "-"}
                      </td>
                    )}
                    {landlordFilter === "active" && (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {landlord.properties}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                            {"tenants" in landlord ? landlord.tenants : 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {"monthlyRevenue" in landlord
                            ? landlord.monthlyRevenue.toLocaleString("vi-VN")
                            : "0"} đ
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={landlordFilter === "pending" ? 5 : 8}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-muted-foreground font-medium">Không có dữ liệu</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
