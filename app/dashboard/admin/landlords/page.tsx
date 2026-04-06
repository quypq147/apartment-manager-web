"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

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

export default function AdminLandlordsPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [filter, setFilter] = useState<LandlordStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadLandlords = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/landlords");
        const result = (await response.json()) as {
          success: boolean;
          error?: string;
          data?: Landlord[];
        };

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Không thể tải danh sách chủ trọ");
        }

        setLandlords(result.data ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Không thể tải danh sách chủ trọ"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadLandlords();
  }, []);

  const displayLandlords = useMemo(() => {
    if (filter === "ALL") {
      return landlords;
    }

    return landlords.filter((landlord) => landlord.status === filter);
  }, [filter, landlords]);

  const updateStatus = async (landlordId: string, status: LandlordStatus) => {
    setActionLoadingId(landlordId);

    try {
      const endpoint =
        status === "ACTIVE"
          ? `/api/admin/landlords/${landlordId}/verify`
          : `/api/admin/landlords/${landlordId}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: status === "ACTIVE" ? undefined : JSON.stringify({ status }),
      });

      const result = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể cập nhật trạng thái chủ trọ");
      }

      setLandlords((prev) =>
        prev.map((landlord) =>
          landlord.id === landlordId ? { ...landlord, status } : landlord
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật trạng thái chủ trọ"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = landlords.filter((landlord) => landlord.status === "PENDING_VERIFICATION").length;
  const activeCount = landlords.filter((landlord) => landlord.status === "ACTIVE").length;
  const rejectedCount = landlords.filter((landlord) => landlord.status === "REJECTED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Danh sách Chủ trọ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem và xử lý toàn bộ chủ trọ trên hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-700">
            Chờ xác nhận: {pendingCount}
          </span>
          <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
            Hoạt động: {activeCount}
          </span>
          <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
            Từ chối: {rejectedCount}
          </span>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("PENDING_VERIFICATION")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "PENDING_VERIFICATION"
                ? "bg-yellow-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Chờ xác nhận
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "ACTIVE"
                ? "bg-green-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Đang hoạt động
          </button>
          <button
            onClick={() => setFilter("REJECTED")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Đã từ chối
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Tên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">SĐT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Khu trọ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : displayLandlords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                displayLandlords.map((landlord) => (
                  <tr key={landlord.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{landlord.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{landlord.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{landlord.phone || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{landlord.propertiesCount}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(landlord.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      {landlord.status === "PENDING_VERIFICATION" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(landlord.id, "ACTIVE")}
                            disabled={actionLoadingId === landlord.id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => updateStatus(landlord.id, "REJECTED")}
                            disabled={actionLoadingId === landlord.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : landlord.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Bộ lọc này dùng API đã lưu trạng thái thực tế trong database.
        </p>
      </section>
    </div>
  );
}
