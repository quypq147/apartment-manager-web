// app/dashboard/owner/contracts/[contractId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContractDetail, type ContractDetail } from "@/lib/api/tenant";
import { renewContract } from "@/lib/api/owner";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Home,
  MapPin,
  User,
  DollarSign,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

function formatDate(input: string | null) {
  if (!input) return "--";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

function getStatusBadge(status: string) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-amber-100 text-amber-700",
    TERMINATED: "bg-red-100 text-red-700",
    UNPAID: "bg-red-100 text-red-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
  };

  const labels = {
    ACTIVE: "Đang hoạt động",
    EXPIRED: "Hết hạn",
    TERMINATED: "Đã thanh lý",
    UNPAID: "Chưa thanh toán",
    PARTIAL: "Thanh toán một phần",
    PAID: "Đã thanh toán",
    OVERDUE: "Quá hạn",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function OwnerContractDetailPage() {
  const params = useParams();
  const contractId = params.contractId as string;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Renew dialog state
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const result = await getContractDetail(contractId);

    if (!result.success) {
      setError(result.error ?? "Không thể tải dữ liệu hợp đồng");
      setLoading(false);
      return;
    }

    setContract(result.data ?? null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [contractId]);

  const handleRenew = async () => {
    if (!renewEndDate) {
      setRenewError("Vui lòng chọn ngày hết hạn mới");
      return;
    }

    setRenewing(true);
    setRenewError(null);

    const result = await renewContract(contractId, renewEndDate);

    if (!result.success) {
      setRenewError(result.error ?? "Không thể gia hạn hợp đồng");
      setRenewing(false);
      return;
    }

    // Reload contract data
    await loadData();
    setShowRenewDialog(false);
    setRenewing(false);
    setRenewEndDate("");
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <p className="text-sm text-red-600">{error || "Không tìm thấy hợp đồng"}</p>
        <Link
          href="/dashboard/owner/contracts"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách hợp đồng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link
          href="/dashboard/owner/contracts"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách hợp đồng
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chi tiết hợp đồng</h1>
            <p className="text-muted-foreground mt-1">Thông tin chi tiết và danh sách hóa đơn</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(contract.status)}
            {(contract.status === "ACTIVE" || contract.status === "EXPIRED") && (
              <button
                onClick={() => setShowRenewDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Gia hạn
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contract Info Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Thông tin hợp đồng</h2>
            <p className="text-sm text-muted-foreground">Mã HĐ: {contract.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Room Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="w-5 h-5" />
              <span className="font-medium">Phòng thuê</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{contract.room.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{contract.room.property.name}</p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Địa chỉ</span>
            </div>
            <p className="text-sm text-foreground">{contract.room.property.address}</p>
          </div>

          {/* Tenant */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="font-medium">Khách thuê</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{contract.tenant.name}</p>
              <p className="text-sm text-muted-foreground">{contract.tenant.phone || contract.tenant.email}</p>
              {contract.tenant.cccd && (
                <p className="text-xs text-muted-foreground mt-1">CCCD: {contract.tenant.cccd}</p>
              )}
            </div>
          </div>

          {/* Contract Duration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Thời hạn hợp đồng</span>
            </div>
            <p className="text-sm text-foreground">
              {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
            </p>
          </div>

          {/* Monthly Rent */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Giá thuê hàng tháng</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(contract.roomPrice)}</p>
          </div>

          {/* Deposit */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Tiền cọc</span>
            </div>
            <p className="text-lg font-bold text-purple-600">{formatCurrency(contract.deposit)}</p>
          </div>
        </div>

        {/* Notes */}
        {contract.notes && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-2">Ghi chú & Điều khoản:</h3>
            <p className="text-sm text-muted-foreground">{contract.notes}</p>
          </div>
        )}

        {/* Warning for expired contracts */}
        {contract.status === "EXPIRED" && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Hợp đồng đã hết hạn</p>
              <p className="text-sm text-amber-700 mt-1">
                Bạn có thể gia hạn hợp đồng bằng cách nhấn nút "Gia hạn" ở trên.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Danh sách hóa đơn</h2>
            <p className="text-sm text-muted-foreground">
              Tất cả hóa đơn theo hợp đồng này ({contract.invoices.length} hóa đơn)
            </p>
          </div>
        </div>

        {contract.invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Chưa có hóa đơn nào.</p>
        ) : (
          <div className="space-y-4">
            {contract.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="border border-border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{invoice.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tháng {invoice.month}/{invoice.year} • {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tổng tiền</p>
                    <p className="font-bold text-foreground mt-1">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Đã thanh toán</p>
                    <p className="font-semibold text-green-600 mt-1">{formatCurrency(invoice.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Còn lại</p>
                    <p className="font-semibold text-red-600 mt-1">{formatCurrency(invoice.remainingAmount)}</p>
                  </div>
                </div>

                {invoice.dueDate && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Hạn thanh toán: {formatDate(invoice.dueDate)}</span>
                  </div>
                )}

                {/* Invoice Items */}
                {invoice.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Chi tiết:</p>
                    <div className="space-y-1">
                      {invoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.service?.name || item.description} ({item.quantity} {item.service?.unit || ""})
                          </span>
                          <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments */}
                {invoice.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Lịch sử thanh toán:</p>
                    <div className="space-y-1">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatDate(payment.paymentDate)} • {payment.paymentMethod}
                          </span>
                          <span className="font-medium text-green-600">+{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renew Dialog */}
      {showRenewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Gia hạn hợp đồng</h3>
            
            {renewError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {renewError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ngày hết hạn hiện tại
                </label>
                <p className="text-sm text-muted-foreground">{formatDate(contract.endDate)}</p>
              </div>

              <div>
                <label htmlFor="renewEndDate" className="block text-sm font-medium text-foreground mb-2">
                  Ngày hết hạn mới <span className="text-red-500">*</span>
                </label>
                <input
                  id="renewEndDate"
                  type="date"
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={renewing}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRenew}
                disabled={renewing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {renewing ? "Đang xử lý..." : "Xác nhận gia hạn"}
              </button>
              <button
                onClick={() => {
                  setShowRenewDialog(false);
                  setRenewError(null);
                  setRenewEndDate("");
                }}
                disabled={renewing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
