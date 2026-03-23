"use client";

import { useEffect, useMemo, type ReactNode, useState } from "react";
import { Home, Building2, MapPin, Zap, Droplets, Wifi, Trash2, ShieldCheck, Wrench } from "lucide-react";
import {
  getTenantDashboard,
  getTenantServices,
  type TenantDashboardData,
  type TenantService,
} from "@/lib/api/tenant";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
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

export default function TenantRoomManagementPage() {
  const [roomInfo, setRoomInfo] = useState<TenantDashboardData["roomInfo"]>(null);
  const [services, setServices] = useState<TenantService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const [dashboardResult, servicesResult] = await Promise.all([
        getTenantDashboard(),
        getTenantServices(),
      ]);

      if (cancelled) {
        return;
      }

      if (!dashboardResult.success) {
        setError(dashboardResult.error ?? "Không thể tải thông tin phòng");
        setRoomInfo(null);
        setServices([]);
        setLoading(false);
        return;
      }

      if (!servicesResult.success) {
        setError(servicesResult.error ?? "Không thể tải dịch vụ phòng");
        setRoomInfo(dashboardResult.data?.roomInfo ?? null);
        setServices([]);
        setLoading(false);
        return;
      }

      setRoomInfo(dashboardResult.data?.roomInfo ?? null);
      setServices(servicesResult.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const monthlyRent = roomInfo?.price ?? 0;

  const serviceTotal = useMemo(
    () =>
      services.reduce((sum, service) => {
        if (!service.enabled) {
          return sum;
        }
        return sum + service.unitPrice * service.quantity;
      }, 0),
    [services]
  );

  const estimatedTotal = monthlyRent + serviceTotal;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý phòng</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi phòng đang thuê và các dịch vụ đi kèm.
          </p>
        </div>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu phòng...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && !roomInfo && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <p className="text-sm text-muted-foreground">Hiện tại bạn chưa có hợp đồng thuê đang hiệu lực.</p>
        </div>
      )}

      {roomInfo && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{roomInfo.name}</h2>
              <p className="text-sm text-muted-foreground">{roomInfo.property}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Khu trọ
              </p>
              <p className="font-medium text-foreground">{roomInfo.property}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Địa chỉ
              </p>
              <p className="font-medium text-foreground">{roomInfo.address}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Diện tích</p>
              <p className="font-medium text-foreground mt-1">
                {typeof roomInfo.area === "number" ? `${roomInfo.area} m2` : "--"}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Sức chứa tối đa</p>
              <p className="font-medium text-foreground mt-1">{roomInfo.capacity} người</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground">Chi phí tạm tính tháng này</h3>
          <div className="space-y-3 mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiền phòng</span>
              <span className="font-semibold text-foreground">{formatCurrency(monthlyRent)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dịch vụ đang tính</span>
              <span className="font-semibold text-foreground">{formatCurrency(serviceTotal)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="font-medium text-foreground">Tổng tạm tính</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(estimatedTotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tổng tạm tính dựa trên giá phòng và dịch vụ hiện đang áp dụng.
          </p>
        </div>
      </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Dịch vụ phòng</h3>
            <p className="text-sm text-muted-foreground">Danh sách dịch vụ được cấu hình cho phòng của bạn.</p>
          </div>
        </div>

        {!loading && !error && services.length === 0 && (
          <p className="text-sm text-muted-foreground mb-4">Phòng hiện tại chưa có dịch vụ nào.</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-190">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Dịch vụ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Đơn giá</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Số lượng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Tạm tính</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => {
                const lineTotal = service.unitPrice * service.quantity;
                return (
                  <tr key={service.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">{getServiceIcon(service.name)}</div>
                        <span className="font-medium text-foreground">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{formatCurrency(service.unitPrice)}/{service.unit}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{service.quantity} {service.unit}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground">{formatCurrency(lineTotal)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${
                          service.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {service.enabled ? "Đang tính" : "Chưa tính"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
