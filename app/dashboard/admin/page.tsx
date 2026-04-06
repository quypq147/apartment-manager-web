// app/dashboard/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type LandlordStatus = "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";

type Landlord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  propertiesCount: number;
  status: LandlordStatus;
};

type AdminOverviewResponse = {
  success: boolean;
  error?: string;
  data?: {
    kpis: {
      totalLandlords: number;
      totalTenants: number;
      totalProperties: number;
      platformRevenue: number;
    };
  };
};

type LandlordsResponse = {
  success: boolean;
  error?: string;
  data?: Landlord[];
};

export default function AdminDashboard() {
  const [landlordFilter, setLandlordFilter] = useState<string>("pending");
  const [kpiData, setKpiData] = useState({
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    platformRevenue: 0,
  });
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [overviewRes, landlordsRes] = await Promise.all([
          fetch("/api/admin/overview"),
          fetch("/api/admin/landlords"),
        ]);

        const overviewJson = (await overviewRes.json()) as AdminOverviewResponse;
        const landlordsJson = (await landlordsRes.json()) as LandlordsResponse;

        if (!overviewRes.ok || !overviewJson.success) {
          throw new Error(overviewJson.error || "Không thể tải dữ liệu tổng quan.");
        }

        if (!landlordsRes.ok || !landlordsJson.success) {
          throw new Error(landlordsJson.error || "Không thể tải danh sách chủ trọ.");
        }

        setKpiData(
          overviewJson.data?.kpis ?? {
            totalLandlords: 0,
            totalTenants: 0,
            totalProperties: 0,
            platformRevenue: 0,
          }
        );
        setLandlords(landlordsJson.data ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Đã có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const pendingLandlords = useMemo(
    () => landlords.filter((item) => item.status === "PENDING_VERIFICATION"),
    [landlords]
  );
  const activeLandlords = useMemo(
    () => landlords.filter((item) => item.status === "ACTIVE"),
    [landlords]
  );

  const displayLandlords = landlordFilter === "pending" ? pendingLandlords : activeLandlords;

  const updateLandlordStatus = async (landlordId: string, status: LandlordStatus) => {
    setActionError(null);
    setActionLoadingId(landlordId);

    try {
      const endpoint =
        status === "ACTIVE"
          ? `/api/admin/landlords/${landlordId}/verify`
          : `/api/admin/landlords/${landlordId}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: status === "ACTIVE" ? undefined : JSON.stringify({ status }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể cập nhật trạng thái chủ trọ.");
      }

      setLandlords((prev) =>
        prev.map((item) =>
          item.id === landlordId
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật trạng thái chủ trọ."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

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
              {loading ? "..." : kpiData.totalLandlords}
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
              {loading ? "..." : kpiData.totalTenants}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">+18 tuần này</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 - Total Properties */}
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Tổng số Khu trọ</h3>
            <p className="text-3xl font-bold mt-2 text-purple-600">
              {loading ? "..." : kpiData.totalProperties}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">+3 tuần này</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 - Platform Revenue */}
        <div className="p-6 bg-card rounded-2xl shadow-sm border border-border flex items-start justify-between">
          <div>
            <h3 className="font-medium text-muted-foreground">Doanh thu tháng này</h3>
            <p className="text-2xl font-bold mt-2 text-amber-600">
              {loading ? "..." : `${kpiData.platformRevenue.toLocaleString("vi-VN")} đ`}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tính toán từ hoa hồng</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
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

        {error && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

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
                      {landlord.phone || "-"}
                    </td>
                    {landlordFilter === "pending" && (
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {new Date(landlord.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    )}
                    {landlordFilter === "active" && (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {landlord.propertiesCount}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      {landlordFilter === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateLandlordStatus(landlord.id, "ACTIVE")}
                            disabled={actionLoadingId === landlord.id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => updateLandlordStatus(landlord.id, "REJECTED")}
                            disabled={actionLoadingId === landlord.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Đang hoạt động</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={landlordFilter === "pending" ? 5 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-muted-foreground font-medium">
                      {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                    </p>
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
