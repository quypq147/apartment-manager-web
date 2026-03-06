"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, MapPin, DoorOpen } from "lucide-react";
import {
  createProperty,
  createRoom,
  getProperties,
  type OwnerProperty,
} from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

export default function PropertiesPage() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showCreateProperty, setShowCreateProperty] = useState(false);
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [activeRoomFormFor, setActiveRoomFormFor] = useState<string | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    address: "",
    description: "",
  });
  const [roomForm, setRoomForm] = useState({
    name: "",
    price: "",
    capacity: "",
    area: "",
  });

  const loadProperties = async () => {
    setLoading(true);
    const result = await getProperties();

    if (!result.success) {
      setError(result.error ?? "Khong the tai danh sach khu tro");
      setLoading(false);
      return;
    }

    setProperties(result.data ?? []);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadOnMount = async () => {
      const result = await getProperties();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Khong the tai danh sach khu tro");
        setLoading(false);
        return;
      }

      setProperties(result.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadOnMount();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateProperty = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingProperty(true);
    setActionMessage(null);

    const result = await createProperty({
      name: propertyForm.name,
      address: propertyForm.address,
      description: propertyForm.description || undefined,
    });

    if (!result.success) {
      setError(result.error ?? "Khong the tao khu tro");
      setCreatingProperty(false);
      return;
    }

    setPropertyForm({ name: "", address: "", description: "" });
    setShowCreateProperty(false);
    setActionMessage("Tao khu tro thanh cong");
    setCreatingProperty(false);
    await loadProperties();
  };

  const handleCreateRoom = async (
    event: React.FormEvent<HTMLFormElement>,
    propertyId: string
  ) => {
    event.preventDefault();
    setCreatingRoom(true);
    setActionMessage(null);

    const result = await createRoom(propertyId, {
      name: roomForm.name,
      price: Number(roomForm.price),
      capacity: Number(roomForm.capacity),
      area: roomForm.area ? Number(roomForm.area) : undefined,
    });

    if (!result.success) {
      setError(result.error ?? "Khong the tao phong");
      setCreatingRoom(false);
      return;
    }

    setRoomForm({ name: "", price: "", capacity: "", area: "" });
    setActiveRoomFormFor(null);
    setActionMessage("Them phong thanh cong");
    setCreatingRoom(false);
    await loadProperties();
  };

  const totals = useMemo(() => {
    const roomCount = properties.reduce((sum, property) => sum + property.rooms.length, 0);
    const rentedCount = properties.reduce(
      (sum, property) =>
        sum + property.rooms.filter((room) => room.status === "RENTED").length,
      0
    );

    return { roomCount, rentedCount };
  }, [properties]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khu Tro & Phong</h1>
          <p className="text-gray-500 text-sm mt-1">Quan ly cac toa nha va trang thai phong cua ban.</p>
          <p className="text-xs text-gray-400 mt-2">
            Tong phong: {totals.roomCount} | Da thue: {totals.rentedCount}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateProperty((prev) => !prev);
            setError(null);
            setActionMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Them Khu Tro
        </button>
      </header>

      {showCreateProperty && (
        <form
          onSubmit={handleCreateProperty}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            value={propertyForm.name}
            onChange={(event) =>
              setPropertyForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Ten khu tro"
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <input
            value={propertyForm.address}
            onChange={(event) =>
              setPropertyForm((prev) => ({ ...prev, address: event.target.value }))
            }
            placeholder="Dia chi"
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <div className="flex gap-2">
            <input
              value={propertyForm.description}
              onChange={(event) =>
                setPropertyForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Mo ta (tuy chon)"
              className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
            />
            <button
              disabled={creatingProperty}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
            >
              {creatingProperty ? "Dang tao..." : "Luu"}
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-gray-500">Dang tai du lieu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionMessage && <p className="text-sm text-green-600">{actionMessage}</p>}

      {!loading && !error && properties.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Chua co khu tro nao.</p>
        </div>
      )}

      <div className="space-y-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">{property.name}</h2>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                    Hoat dong
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                  <MapPin className="w-4 h-4" />
                  {property.address}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveRoomFormFor((prev) =>
                      prev === property.id ? null : property.id
                    );
                    setError(null);
                    setActionMessage(null);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Them phong
                </button>
              </div>
            </div>

            {activeRoomFormFor === property.id && (
              <form
                onSubmit={(event) => handleCreateRoom(event, property.id)}
                className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-3"
              >
                <input
                  value={roomForm.name}
                  onChange={(event) =>
                    setRoomForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ten phong"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={roomForm.price}
                  onChange={(event) =>
                    setRoomForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  placeholder="Gia thue"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={(event) =>
                    setRoomForm((prev) => ({ ...prev, capacity: event.target.value }))
                  }
                  placeholder="Suc chua"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={roomForm.area}
                    onChange={(event) =>
                      setRoomForm((prev) => ({ ...prev, area: event.target.value }))
                    }
                    placeholder="Dien tich"
                    className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                  />
                  <button
                    disabled={creatingRoom}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
                  >
                    {creatingRoom ? "Dang tao..." : "Luu"}
                  </button>
                </div>
              </form>
            )}

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.rooms.length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50">
                    <p className="text-sm text-gray-500">Khu tro chua co phong nao.</p>
                  </div>
                )}

                {property.rooms.map((room) => (
                  <div key={room.id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{room.name}</span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
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
                    </div>
                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <p className="flex justify-between">
                        <span>Gia thue:</span>
                        <span className="font-medium text-gray-900">{currency.format(room.price)} đ</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Suc chua:</span>
                        <span>{room.capacity} nguoi</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}