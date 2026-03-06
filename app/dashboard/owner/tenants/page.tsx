"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import {
  createContract,
  getTenants,
  getProperties,
  type OwnerTenantContract,
  type OwnerProperty,
} from "@/lib/api/owner";

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("vi-VN");
}

function getAvailableRooms(properties: OwnerProperty[]) {
  const available = [];
  for (const property of properties) {
    for (const room of property.rooms) {
      if (room.status === "AVAILABLE") {
        available.push({
          id: room.id,
          name: room.name,
          price: room.price,
          propertyName: property.name,
        });
      }
    }
  }
  return available;
}

export default function TenantsPage() {
  const [contracts, setContracts] = useState<OwnerTenantContract[]>([]);
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    tenantCccd: "",
    startDate: "",
    endDate: "",
    deposit: "",
  });

  const loadContracts = async () => {
    setLoading(true);
    const result = await getTenants();

    if (!result.success) {
      setError(result.error ?? "Không thể tải danh sách khách thuê");
      setLoading(false);
      return;
    }

    setContracts(result.data ?? []);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [contractsRes, propertiesRes] = await Promise.all([getTenants(), getProperties()]);

      if (cancelled) {
        return;
      }

      if (!contractsRes.success) {
        setError(contractsRes.error ?? "Không thể tải danh sách khách thuê");
        setLoading(false);
        return;
      }

      setContracts(contractsRes.data ?? []);
      setProperties(propertiesRes.data ?? []);
      setError(null);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateContract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingContract(true);
    setMessage(null);
    setError(null);

    const depositNum = Number(formData.deposit);
    if (Number.isNaN(depositNum) || depositNum < 0) {
      setError("Tiền đặt cọc phải là số lớn hơn 0");
      setCreatingContract(false);
      return;
    }

    const result = await createContract({
      roomId: formData.roomId,
      tenantName: formData.tenantName,
      tenantEmail: formData.tenantEmail,
      tenantPhone: formData.tenantPhone || undefined,
      tenantCccd: formData.tenantCccd || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      deposit: depositNum,
    });

    if (!result.success) {
      setError(result.error ?? "Không thể tạo hợp đồng");
      setCreatingContract(false);
      return;
    }

    setFormData({
      roomId: "",
      tenantName: "",
      tenantEmail: "",
      tenantPhone: "",
      tenantCccd: "",
      startDate: "",
      endDate: "",
      deposit: "",
    });
    setShowCreateForm(false);
    setMessage("Tạo hợp đồng thành công");
    setCreatingContract(false);
    await loadContracts();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return contracts;
    }

    const keyword = search.trim().toLowerCase();
    return contracts.filter((item) => {
      const tenant = item.tenant;
      return (
        tenant.name.toLowerCase().includes(keyword) ||
        tenant.phone?.toLowerCase().includes(keyword) ||
        item.room.name.toLowerCase().includes(keyword)
      );
    });
  }, [contracts, search]);

  const availableRooms = useMemo(() => getAvailableRooms(properties), [properties]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khách Thuê</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý thông tin khách thuê và hợp đồng hiện tại.</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm((prev) => !prev);
            setError(null);
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? "Đóng" : "Thêm hợp đồng"}
        </button>
      </header>

      {showCreateForm && (
        <form
          onSubmit={handleCreateContract}
          className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-foreground">Thêm Hợp Đồng Mới</h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Phòng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roomId}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, roomId: event.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              >
                <option value="">-- Chọn phòng --</option>
                {availableRooms.length === 0 ? (
                  <option disabled>Không có phòng trống</option>
                ) : (
                  availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.propertyName} - {room.name} ({room.price} đ/tháng)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Tên Khách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, tenantName: event.target.value }))
                }
                placeholder="Họ và tên"
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Email Khách <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.tenantEmail}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, tenantEmail: event.target.value }))
                }
                placeholder="khach@example.com"
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={formData.tenantPhone}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, tenantPhone: event.target.value }))
                }
                placeholder="0123456789"
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Số CCCD
              </label>
              <input
                type="text"
                value={formData.tenantCccd}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, tenantCccd: event.target.value }))
                }
                placeholder="123456789"
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Tiền Đặt Cọc <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.deposit}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, deposit: event.target.value }))
                }
                placeholder="0"
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ngày Bắt Đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, startDate: event.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ngày Kết Thúc (Tùy Chọn)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creatingContract || availableRooms.length === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
            >
              {creatingContract ? "Đang tạo..." : "Tạo Hợp Đồng"}
            </button>
          </div>
        </form>
      )}

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên, SĐT, số phòng..."
          className="w-full pl-9 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-background text-foreground"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Khách Thuê</th>
              <th className="px-6 py-4 font-medium">Phòng</th>
              <th className="px-6 py-4 font-medium">Liên Hệ</th>
              <th className="px-6 py-4 font-medium">Ngày Vào Ở</th>
              <th className="px-6 py-4 font-medium">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-sm text-muted-foreground" colSpan={5}>
                  Không có dữ liệu khách thuê.
                </td>
              </tr>
            )}

            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{item.tenant.name}</div>
                  <div className="text-xs text-muted-foreground">CCCD: {item.tenant.cccd ?? "--"}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-card-foreground font-medium text-xs">
                    {item.room.name}
                  </span>
                </td>
                <td className="px-6 py-4">{item.tenant.phone ?? "--"}</td>
                <td className="px-6 py-4">{formatDate(item.startDate)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : item.status === "EXPIRED"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status === "ACTIVE"
                      ? "Đang Hiệu Lực"
                      : item.status === "EXPIRED"
                        ? "Hết Hạn"
                        : "Đã Thanh Lý"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}