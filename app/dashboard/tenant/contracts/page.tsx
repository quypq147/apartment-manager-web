// app/dashboard/tenant/contracts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getTenantContracts, type TenantContract } from "@/lib/api/tenant";
import { BookOpen, Download } from "lucide-react";

function formatDate(input: string | null) {
  if (!input) {
    return "--";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("vi-VN");
}

function getRemainingTime(endDate: string | null) {
  if (!endDate) {
    return "Không thời hạn";
  }

  const now = new Date();
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return "--";
  }

  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) {
    return "Đã hết hạn";
  }

  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  return `${months} tháng ${days} ngày`;
}

export default function TenantContracts() {
  const [contracts, setContracts] = useState<TenantContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const result = await getTenantContracts();

      if (cancelled) {
        return;
      }

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

  const sortedContracts = useMemo(
    () => [...contracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [contracts]
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hợp đồng của tôi</h1>
          <p className="text-muted-foreground mt-1">Xem thông tin và tải về hợp đồng thuê phòng.</p>
        </div>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && sortedContracts.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">Bạn chưa có hợp đồng nào.</p>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-6">
        {sortedContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{contract.roomName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{contract.property}</p>
                    <p className="text-sm text-muted-foreground">Mã hợp đồng: {contract.id}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                    contract.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : contract.status === "EXPIRED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {contract.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : contract.status === "EXPIRED"
                      ? "Hết hạn"
                      : "Đã thanh lý"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Chủ trọ</p>
                  <p className="font-medium text-foreground mt-2">{contract.landlord}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời hạn</p>
                  <p className="font-medium text-foreground mt-2">
                    {formatDate(contract.startDate)} đến {formatDate(contract.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
                  <p className="font-medium text-foreground mt-2">{getRemainingTime(contract.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá thuê hàng tháng</p>
                  <p className="font-medium text-foreground mt-2">
                    {contract.roomPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiền cọc</p>
                  <p className="font-medium text-foreground mt-2">
                    {contract.deposit.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điều khoản chính</p>
                  <p className="font-medium text-foreground mt-2 text-sm">{contract.terms || "--"}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  <Download className="w-5 h-5" />
                  Tải hợp đồng PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
