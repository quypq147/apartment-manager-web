"use client";

import { useMemo, useState } from "react";
import { Home, Building2, MapPin, Zap, Droplets, Wifi, Trash2, ShieldCheck } from "lucide-react";

type ServiceKey = "electricity" | "water" | "wifi" | "trash" | "security";

interface ServiceState {
  key: ServiceKey;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  includedInInvoice: boolean;
  icon: React.ReactNode;
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

export default function TenantRoomManagementPage() {
  const [services, setServices] = useState<ServiceState[]>([
    {
      key: "electricity",
      name: "Điện sinh hoạt",
      unit: "kWh",
      unitPrice: 3500,
      quantity: 128,
      includedInInvoice: true,
      icon: <Zap className="w-5 h-5 text-amber-600" />,
    },
    {
      key: "water",
      name: "Nước sinh hoạt",
      unit: "m3",
      unitPrice: 18000,
      quantity: 14,
      includedInInvoice: true,
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
    },
    {
      key: "wifi",
      name: "Internet",
      unit: "tháng",
      unitPrice: 180000,
      quantity: 1,
      includedInInvoice: true,
      icon: <Wifi className="w-5 h-5 text-cyan-600" />,
    },
    {
      key: "trash",
      name: "Vệ sinh rác",
      unit: "tháng",
      unitPrice: 35000,
      quantity: 1,
      includedInInvoice: true,
      icon: <Trash2 className="w-5 h-5 text-green-600" />,
    },
    {
      key: "security",
      name: "An ninh & giữ xe",
      unit: "tháng",
      unitPrice: 120000,
      quantity: 1,
      includedInInvoice: false,
      icon: <ShieldCheck className="w-5 h-5 text-violet-600" />,
    },
  ]);

  const monthlyRent = 3500000;

  const serviceTotal = useMemo(
    () =>
      services.reduce((sum, service) => {
        if (!service.includedInInvoice) {
          return sum;
        }
        return sum + service.unitPrice * service.quantity;
      }, 0),
    [services]
  );

  const estimatedTotal = monthlyRent + serviceTotal;

  const toggleService = (key: ServiceKey) => {
    setServices((prev) =>
      prev.map((service) =>
        service.key === key
          ? { ...service, includedInInvoice: !service.includedInInvoice }
          : service
      )
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý phòng</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi phòng đang thuê và các dịch vụ đi kèm (mock trước khi nối API).
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Phòng B-302</h2>
              <p className="text-sm text-muted-foreground">Tòa nhà Sunrise Mini Apartment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Khu trọ
              </p>
              <p className="font-medium text-foreground">Sunrise Mini Apartment</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Địa chỉ
              </p>
              <p className="font-medium text-foreground">28 Nguyễn Trãi, Quận 1, TP.HCM</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Diện tích</p>
              <p className="font-medium text-foreground mt-1">24 m2</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Sức chứa tối đa</p>
              <p className="font-medium text-foreground mt-1">2 người</p>
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
            Giá trị trên chỉ để mô phỏng, sẽ thay bằng dữ liệu API thực tế.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Dịch vụ phòng</h3>
            <p className="text-sm text-muted-foreground">Bật/tắt mô phỏng dịch vụ tính vào hóa đơn tháng.</p>
          </div>
        </div>

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
                  <tr key={service.key} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">{service.icon}</div>
                        <span className="font-medium text-foreground">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{formatCurrency(service.unitPrice)}/{service.unit}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{service.quantity} {service.unit}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground">{formatCurrency(lineTotal)}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleService(service.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          service.includedInInvoice
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {service.includedInInvoice ? "Đang tính" : "Tắt tính phí"}
                      </button>
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
