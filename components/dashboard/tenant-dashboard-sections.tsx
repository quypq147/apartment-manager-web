import Link from "next/link";
import { AlertCircle, Home, QrCode, X } from "lucide-react";
import type { TenantDashboardInvoice, TenantNotification } from "@/lib/api/tenant";
import { NotificationsList } from "@/components/notification-card";
import type { TenantRoomInfo } from "@/app/dashboard/tenant/use-tenant-dashboard";

function formatDate(input: string | null) {
  if (!input) {
    return "--";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("vi-VN");
}

type TenantDashboardHeaderProps = {
  title: string;
  description: string;
};

export function TenantDashboardHeader({ title, description }: TenantDashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </header>
  );
}

type TenantNotificationsPanelProps = {
  notifications: TenantNotification[];
  loading: boolean;
  onDismiss: (id: string) => void;
};

export function TenantNotificationsPanel({
  notifications,
  loading,
  onDismiss,
}: TenantNotificationsPanelProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-blue-900 mb-4">Thông báo quan trọng</h2>
      <NotificationsList notifications={notifications} loading={loading} onDismiss={onDismiss} />
    </div>
  );
}

type TenantRoomInfoCardProps = {
  roomInfo: TenantRoomInfo;
};

export function TenantRoomInfoCard({ roomInfo }: TenantRoomInfoCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{roomInfo.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{roomInfo.property}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Địa chỉ</p>
            <p className="font-medium text-foreground mt-1">{roomInfo.address}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diện tích</p>
            <p className="font-medium text-foreground mt-1">
              {typeof roomInfo.area === "number" ? `${roomInfo.area}m²` : "--"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Giá thuê hàng tháng</p>
            <p className="font-medium text-foreground mt-1">
              {roomInfo.price.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thời hạn hợp đồng</p>
            <p className="font-medium text-foreground mt-1">
              {formatDate(roomInfo.contractStartDate)} đến {formatDate(roomInfo.contractEndDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type TenantUnpaidInvoicesAlertProps = {
  count: number;
  onPayNow: () => void;
};

export function TenantUnpaidInvoicesAlert({ count, onPayNow }: TenantUnpaidInvoicesAlertProps) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-900">Có {count} hóa đơn chưa thanh toán</h3>
          <p className="text-red-700 text-sm mt-2">
            Vui lòng thanh toán các hóa đơn để tránh bị ngắt nước/điện.
          </p>
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button
              onClick={onPayNow}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Thanh toán ngay
            </button>
            <Link
              href="/dashboard/tenant/invoices"
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors inline-flex items-center justify-center"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type TenantUnpaidInvoicesSummaryProps = {
  invoices: TenantDashboardInvoice[];
};

export function TenantUnpaidInvoicesSummary({ invoices }: TenantUnpaidInvoicesSummaryProps) {
  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-bold text-lg text-foreground">Hóa đơn cần thanh toán</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                  {invoice.month}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Hóa đơn tháng {invoice.month}/{invoice.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hạn chốt: {formatDate(invoice.dueDate)}
                  </p>
                  {invoice.status === "PARTIAL" && (
                    <p className="text-sm text-blue-600 font-medium">
                      Đã thanh toán: {invoice.paidAmount?.toLocaleString("vi-VN")} đ
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground">
                  {invoice.totalAmount.toLocaleString("vi-VN")} đ
                </p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-md mt-2 ${
                    invoice.status === "UNPAID"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {invoice.status === "UNPAID" ? "Chưa thanh toán" : "Thanh toán một phần"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type TenantPaymentModalProps = {
  open: boolean;
  outstandingAmount: number;
  paymentProcessing: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
};

export function TenantPaymentModal({
  open,
  outstandingAmount,
  paymentProcessing,
  onClose,
  onConfirmPayment,
}: TenantPaymentModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Mã QR thanh toán</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="w-full aspect-square bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <QrCode className="w-24 h-24 text-white" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Tổng số tiền cần thanh toán</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {outstandingAmount.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600">
              📱 Thanh toán qua VNPAY để hệ thống tự động cập nhật trạng thái hóa đơn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onConfirmPayment}
            disabled={paymentProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {paymentProcessing ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
          </button>
          <button
            onClick={onClose}
            disabled={paymentProcessing}
            className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

type TenantStatusMessageProps = {
  message: string;
  tone: "success" | "error";
};

export function TenantStatusMessage({ message, tone }: TenantStatusMessageProps) {
  const styles =
    tone === "success"
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-red-50 border-red-200 text-red-600";

  return (
    <div className={`border rounded-2xl p-4 ${styles}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function TenantLoadingMessage() {
  return <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>;
}

export function TenantNoActiveContractCard() {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
      <p className="text-sm text-muted-foreground">
        Hiện tại bạn chưa có hợp đồng thuê đang hiệu lực.
      </p>
    </div>
  );
}
