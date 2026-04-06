"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DoorOpen,
  MapPin,
  PencilRuler,
  Trash2,
} from "lucide-react";
import {
  deleteProperty,
  getProperties,
  type OwnerProperty,
} from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

interface PropertyDetailPageProps {
  params: Promise<{
    propertyId: string;
  }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState<string>("");
  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProperty = async () => {
      const resolvedParams = await params;
      if (cancelled) {
        return;
      }

      setPropertyId(resolvedParams.propertyId);

      const result = await getProperties();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Khong the tai du lieu khu tro");
        setLoading(false);
        return;
      }

      const currentProperty =
        result.data?.find((item) => item.id === resolvedParams.propertyId) ?? null;

      if (!currentProperty) {
        setError("Khong tim thay khu tro");
        setLoading(false);
        return;
      }

      setProperty(currentProperty);
      setError(null);
      setLoading(false);
    };

    void loadProperty();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const roomStats = useMemo(() => {
    if (!property) {
      return {
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
      };
    }

    return {
      total: property.rooms.length,
      available: property.rooms.filter((room) => room.status === "AVAILABLE").length,
      rented: property.rooms.filter((room) => room.status === "RENTED").length,
      maintenance: property.rooms.filter((room) => room.status === "MAINTENANCE").length,
    };
  }, [property]);

  const handleDeleteProperty = async () => {
    if (!property) {
      return;
    }

    if (property.rooms.length > 0) {
      setActionMessage("Chỉ có thể xóa khu trọ chưa có phòng");
      return;
    }

    const confirmed = window.confirm(
      `Xóa khu trọ ${property.name}? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionMessage(null);

    const result = await deleteProperty(property.id);

    if (!result.success) {
      setActionMessage(result.error ?? "Không thể xóa khu trọ");
      setDeleting(false);
      return;
    }

    router.push("/dashboard/owner/properties");
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/owner/properties"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách khu trọ
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">Quản lý khu trọ</h1>
        </div>

        {propertyId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/dashboard/owner/properties/${propertyId}/room`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <PencilRuler className="w-4 h-4" />
              Quản lý phòng
            </Link>
            {property && property.rooms.length === 0 && (
              <button
                type="button"
                onClick={handleDeleteProperty}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Đang xóa..." : "Xóa khu trọ"}
              </button>
            )}
          </div>
        )}
      </header>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionMessage && <p className="text-sm text-amber-600">{actionMessage}</p>}

      {!loading && !error && property && (
        <>
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground">{property.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              {property.address}
            </div>
            {property.description && (
              <p className="text-sm text-muted-foreground">{property.description}</p>
            )}
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tổng phòng</p>
              <p className="text-2xl font-bold text-foreground mt-1">{roomStats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Phòng trống</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{roomStats.available}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Đã thuê</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{roomStats.rented}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Bảo trì</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{roomStats.maintenance}</p>
            </div>
          </section>

          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Danh sách phòng</h3>

            {property.rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khu trọ này chưa có phòng nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.rooms.map((room) => (
                  <div key={room.id} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-foreground">{room.name}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          room.status === "RENTED"
                            ? "bg-blue-50 text-blue-700"
                            : room.status === "AVAILABLE"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {room.status === "RENTED"
                          ? "Đã thuê"
                          : room.status === "AVAILABLE"
                            ? "Phòng trống"
                            : "Bảo trì"}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      <p className="flex justify-between">
                        <span>Giá thuê</span>
                        <span className="text-foreground font-medium">
                          {currency.format(room.price)} d
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Sức chứa</span>
                        <span>{room.capacity} người</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Diện tích</span>
                        <span>{room.area ?? "-"} m2</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}