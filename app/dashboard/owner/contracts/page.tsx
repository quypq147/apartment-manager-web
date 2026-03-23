// app/dashboard/owner/contracts/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { getTenants, type OwnerTenantContract } from "@/lib/api/owner";
import { FileText, Eye, Calendar, User, Home } from "lucide-react";
import Link from "next/link";

function formatDate(input: string | null) {
  if (!input) return "Không thời hạn";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function getStatusBadge(status: string) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-amber-100 text-amber-700",
    TERMINATED: "bg-red-100 text-red-700",
  };

  const labels = {
    ACTIVE: "Đang hoạt động",
    EXPIRED: "Hết hạn",
    TERMINATED: "Đã thanh lý",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<OwnerTenantContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const result = await getTenants();

      if (cancelled) return;

      if (!result.success) {
        setError(result.error ?? "Không thể tải dữ liệu hợp đồng");
        setLoading(false);
        return;
      }

      setContracts(result.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result.sort((a, b) => {
      // Sort by status priority: ACTIVE > EXPIRED > TERMINATED
      const statusPriority = { ACTIVE: 0, EXPIRED: 1, TERMINATED: 2 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] ?? 3;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] ?? 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by startDate desc
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [contracts, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      ALL: contracts.length,
      ACTIVE: contracts.filter((c) => c.status === "ACTIVE").length,
      EXPIRED: contracts.filter((c) => c.status === "EXPIRED").length,
      TERMINATED: contracts.filter((c) => c.status === "TERMINATED").length,
    };
  }, [contracts]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý hợp đồng</h1>
          <p className="text-muted-foreground mt-1">Xem và quản lý tất cả hợp đồng thuê phòng</p>
        </div>
      </header>

      {/* Status Filter Tabs */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "ACTIVE", label: "Đang hoạt động" },
            { key: "EXPIRED", label: "Hết hạn" },
            { key: "TERMINATED", label: "Đã thanh lý" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-sm">
                ({statusCounts[tab.key as keyof typeof statusCounts]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {!loading && !error && filteredContracts.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">
            {statusFilter === "ALL" 
              ? "Chưa có hợp đồng nào." 
              : `Không có hợp đồng ${statusFilter === "ACTIVE" ? "đang hoạt động" : statusFilter === "EXPIRED" ? "hết hạn" : "đã thanh lý"}.`}
          </p>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:border-blue-300 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground">{contract.room.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{contract.room.property.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Mã HĐ: {contract.id}</p>
                  </div>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Tenant Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Khách thuê</span>
                  </div>
                  <p className="font-medium text-foreground">{contract.tenant.name}</p>
                  <p className="text-xs text-muted-foreground">{contract.tenant.phone || contract.tenant.email}</p>
                </div>

                {/* Property Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="w-4 h-4" />
                    <span>Khu trọ</span>
                  </div>
                  <p className="font-medium text-foreground">{contract.room.property.name}</p>
                  <p className="text-xs text-muted-foreground">{contract.room.property.address}</p>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Thời hạn</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(contract.startDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    → {formatDate(contract.endDate)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1">
                  <Link
                    href={`/dashboard/owner/contracts/${contract.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
