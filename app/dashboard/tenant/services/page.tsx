"use client";

import { useMemo, useState } from "react";
import { Wifi, Droplets, Zap, Trash2, ShieldCheck, Wrench } from "lucide-react";

type ServiceKey = "wifi" | "water" | "electricity" | "trash" | "security" | "maintenance";

interface TenantService {
  key: ServiceKey;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  note: string;
  enabled: boolean;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export default function TenantServicesPage() {
  const [services, setServices] = useState<TenantService[]>([
    {
      key: "wifi",
      name: "WiFi",
      unit: "tháng",
      unitPrice: 180000,
      quantity: 1,
      note: "Gói internet cáp quang tốc độ cao",
      enabled: true,
    },
    {
      key: "water",
      name: "Nước sinh hoạt",
      unit: "m3",
      unitPrice: 18000,
      quantity: 12,
      note: "Tính theo chỉ số đồng hồ nước",
      enabled: true,
    },
    {
      key: "electricity",
      name: "Điện sinh hoạt",
      unit: "kWh",
      unitPrice: 3500,
      quantity: 126,
      note: "Tính theo chỉ số đồng hồ điện",
      enabled: true,
    },
    {
      key: "trash",
      name: "Vệ sinh rác",
      unit: "tháng",
      unitPrice: 35000,
      quantity: 1,
      note: "Thu gom rác định kỳ",
      enabled: true,
    },
    {
      key: "security",
      name: "An ninh & giữ xe",
      unit: "tháng",
      unitPrice: 120000,
      quantity: 1,
      note: "Giữ xe và camera an ninh",
      enabled: false,
    },
    {
      key: "maintenance",
      name: "Bảo trì chung",
      unit: "tháng",
      unitPrice: 50000,
      quantity: 1,
      note: "Bảo trì khu vực chung và thiết bị",
      enabled: false,
    },
  ]);

  const serviceIcons: Record<ServiceKey, React.ReactNode> = {
    wifi: <Wifi className="w-5 h-5 text-cyan-600" />,
    water: <Droplets className="w-5 h-5 text-blue-600" />,
    electricity: <Zap className="w-5 h-5 text-amber-600" />,
    trash: <Trash2 className="w-5 h-5 text-green-600" />,
    security: <ShieldCheck className="w-5 h-5 text-violet-600" />,
    maintenance: <Wrench className="w-5 h-5 text-orange-600" />,
  };

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

  const toggleService = (key: ServiceKey) => {
    setServices((prev) =>
      prev.map((service) =>
        service.key === key
          ? {
              ...service,
              enabled: !service.enabled,
            }
          : service
      )
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi các dịch vụ phòng trọ cơ bản (WiFi, nước, điện, ...) trước khi nối dữ liệu API.
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
            Dữ liệu đang là mock để hoàn thiện giao diện tenant services.
          </p>
        </div>
      </div>

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
                <tr key={service.key} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">{serviceIcons[service.key]}</div>
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
                    <button
                      onClick={() => toggleService(service.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        service.enabled
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {service.enabled ? "Đang tính phí" : "Chưa tính phí"}
                    </button>
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