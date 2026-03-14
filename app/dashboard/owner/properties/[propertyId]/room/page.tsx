"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import {
  createRoom,
  getProperties,
  getServices,
  type OwnerProperty,
  type OwnerService,
} from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

interface ManageRoomsPageProps {
  params: Promise<{
    propertyId: string;
  }>;
}

export default function ManageRoomsPage({ params }: ManageRoomsPageProps) {
  const [propertyId, setPropertyId] = useState<string>("");
  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<OwnerService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    capacity: "",
    area: "",
  });

  const loadProperty = async () => {
    const resolvedParams = await params;
    setPropertyId(resolvedParams.propertyId);

    const [propertiesResult, servicesResult] = await Promise.all([
      getProperties(),
      getServices({ propertyId: resolvedParams.propertyId }),
    ]);

    if (!propertiesResult.success || !servicesResult.success) {
      setError(propertiesResult.error ?? servicesResult.error ?? "Khong the tai du lieu");
      setLoading(false);
      return;
    }

    const foundProperty =
      propertiesResult.data?.find((item) => item.id === resolvedParams.propertyId) ?? null;

    if (!foundProperty) {
      setError("Khong tim thay khu tro");
      setLoading(false);
      return;
    }

    setProperty(foundProperty);
    const loadedServices = servicesResult.data ?? [];
    setServices(loadedServices);

    const defaultServiceIds = loadedServices
      .filter((service) => {
        const normalizedName = service.name.trim().toLowerCase();
        return normalizedName === "điện" || normalizedName === "nước";
      })
      .map((service) => service.id);

    setSelectedServiceIds(defaultServiceIds);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadProperty();
  }, [params]);

  const roomSummary = useMemo(() => {
    if (!property) {
      return { total: 0, available: 0, rented: 0, maintenance: 0 };
    }

    return {
      total: property.rooms.length,
      available: property.rooms.filter((room) => room.status === "AVAILABLE").length,
      rented: property.rooms.filter((room) => room.status === "RENTED").length,
      maintenance: property.rooms.filter((room) => room.status === "MAINTENANCE").length,
    };
  }, [property]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!propertyId) {
      setError("Thieu propertyId");
      return;
    }

    setCreating(true);
    setMessage(null);
    setError(null);

    const result = await createRoom(propertyId, {
      name: form.name,
      price: Number(form.price),
      capacity: Number(form.capacity),
      area: form.area ? Number(form.area) : undefined,
      serviceIds: selectedServiceIds,
    });

    if (!result.success) {
      setError(result.error ?? "Khong the tao phong");
      setCreating(false);
      return;
    }

    setForm({
      name: "",
      price: "",
      capacity: "",
      area: "",
    });
    setMessage("Them phong thanh cong");
    setCreating(false);
    await loadProperty();
  };

  const additionalServices = useMemo(() => {
    return services.filter((service) => {
      const normalizedName = service.name.trim().toLowerCase();
      return normalizedName !== "điện" && normalizedName !== "nước";
    });
  }, [services]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }

      return [...prev, serviceId];
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={propertyId ? `/dashboard/owner/properties/${propertyId}` : "/dashboard/owner/properties"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lai chi tiet khu tro
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">Quan ly phong</h1>
          {property && (
            <p className="text-sm text-muted-foreground mt-1">
              Khu tro: <span className="text-foreground font-medium">{property.name}</span>
            </p>
          )}
        </div>
      </header>

      <section className="bg-card rounded-2xl shadow-sm border border-border p-4 md:p-6">
        <h2 className="font-semibold text-foreground">Them phong moi</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ten phong"
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
            required
          />
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="Gia thue"
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
            required
          />
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, capacity: event.target.value }))
            }
            placeholder="Suc chua"
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
            required
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={form.area}
              onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
              placeholder="Dien tich"
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground flex-1"
            />
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {creating ? "Dang tao..." : "Them"}
            </button>
          </div>

          <div className="md:col-span-4 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Dịch vụ áp dụng cho phòng</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <label className="inline-flex items-center gap-2 text-foreground">
                <input type="checkbox" checked disabled />
                Điện (gắn sẵn)
              </label>
              <label className="inline-flex items-center gap-2 text-foreground">
                <input type="checkbox" checked disabled />
                Nước (gắn sẵn)
              </label>

              {additionalServices.map((service) => (
                <label key={service.id} className="inline-flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => handleToggleService(service.id)}
                  />
                  {service.name} ({service.unit})
                </label>
              ))}
            </div>

            {additionalServices.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Chưa có dịch vụ tùy chọn khác. Bạn có thể thêm tại trang Quản lý Dịch vụ.
              </p>
            )}
          </div>
        </form>
      </section>

      {loading && <p className="text-sm text-muted-foreground">Dang tai du lieu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      {!loading && !error && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tong phong</p>
              <p className="text-2xl font-bold text-foreground mt-1">{roomSummary.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Phong trong</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{roomSummary.available}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Da thue</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{roomSummary.rented}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Bao tri</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{roomSummary.maintenance}</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Danh sach phong</h3>

            {!property || property.rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co phong nao trong khu tro nay.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border text-muted-foreground">
                      <th className="py-2 pr-3">Phong</th>
                      <th className="py-2 pr-3">Gia thue</th>
                      <th className="py-2 pr-3">Suc chua</th>
                      <th className="py-2 pr-3">Dien tich</th>
                      <th className="py-2">Trang thai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.rooms.map((room) => (
                      <tr key={room.id} className="border-b border-border/60">
                        <td className="py-3 pr-3 font-medium text-foreground">{room.name}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{currency.format(room.price)} d</td>
                        <td className="py-3 pr-3 text-muted-foreground">{room.capacity}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{room.area ?? "-"} m2</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              room.status === "RENTED"
                                ? "bg-blue-50 text-blue-700"
                                : room.status === "AVAILABLE"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {room.status === "RENTED"
                              ? "Da thue"
                              : room.status === "AVAILABLE"
                                ? "Phong trong"
                                : "Bao tri"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}