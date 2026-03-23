"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Wifi, Droplets, Zap, Trash2, ShieldCheck, Wrench } from "lucide-react";
import {
  getTenantServices,
  type TenantService,
} from "@/lib/api/tenant";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function normalizeVietnameseText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Đđ]/g, "d")
    .trim()
    .toLowerCase();
}

function getServiceIcon(name: string): ReactNode {
  const normalized = normalizeVietnameseText(name);

  if (normalized.includes("wifi") || normalized.includes("internet")) {
    return <Wifi className="w-5 h-5 text-cyan-600" />;
  }

  if (normalized.includes("nuoc")) {
    return <Droplets className="w-5 h-5 text-blue-600" />;
  }

  if (normalized.includes("dien")) {
    return <Zap className="w-5 h-5 text-amber-600" />;
  }

  if (normalized.includes("rac") || normalized.includes("ve sinh")) {
    return <Trash2 className="w-5 h-5 text-green-600" />;
  }

  if (normalized.includes("an ninh") || normalized.includes("giu xe")) {
    return <ShieldCheck className="w-5 h-5 text-violet-600" />;
  }

  return <Wrench className="w-5 h-5 text-orange-600" />;
}

export default function TenantServicesPage() {
  const [services, setServices] = useState<TenantService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadServices = async () => {
      setLoading(true);
      const result = await getTenantServices();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Không thể tải dịch vụ");
        setServices([]);
        setLoading(false);
        return;
      }

      setServices(result.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  const includedTotal = useMemo(
    () =>
      services.reduce((sum, service) => {
        if (!service.enabled) {
          return sum;
        }
        return sum + service.unitPrice * service.quantity;
      }, 0),
    [services]
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi các dịch vụ được áp dụng cho phòng của bạn.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-foreground">Danh sách dịch vụ</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bật/tắt mô phỏng dịch vụ tính vào hóa đơn tháng.
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">Tổng phí dịch vụ tạm tính</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(includedTotal)}</p>
          <p className="text-xs text-muted-foreground mt-3">
            Mức phí hiển thị theo dịch vụ đang áp dụng cho phòng hiện tại.
          </p>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dịch vụ...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && services.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">Phòng hiện tại chưa có dịch vụ nào.</p>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-210">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Đơn giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Số lượng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Tạm tính</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Ghi chú</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">{getServiceIcon(service.name)}</div>
                      <span className="font-medium text-foreground">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {formatCurrency(service.unitPrice)}/{service.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {service.quantity} {service.unit}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {formatCurrency(service.unitPrice * service.quantity)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.note}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${
                        service.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {service.enabled ? "Đang tính phí" : "Chưa tính phí"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}