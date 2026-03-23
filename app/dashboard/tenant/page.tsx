// app/dashboard/tenant/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createVnpayPaymentUrl, getTenantDashboard, getTenantNotifications, type TenantDashboardInvoice, type TenantNotification } from "@/lib/api/tenant";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  AlertCircle,
  QrCode,
  X,
} from "lucide-react";
import { NotificationsList } from "@/components/notification-card";
import { AIOverview } from "@/components/dashboard/ai-overview";

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

function TenantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<{
    name: string;
    property: string;
    address: string;
    price: number;
    area: number | null;
    contractStartDate: string;
    contractEndDate: string | null;
  } | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<TenantDashboardInvoice[]>([]);
  const [notifications, setNotifications] = useState<TenantNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const [dashResult, notifResult] = await Promise.all([
        getTenantDashboard(),
        getTenantNotifications(),
      ]);

      if (cancelled) {
        return;
      }

      if (!dashResult.success) {
        setError(dashResult.error ?? "Không thể tải dữ liệu tổng quan");
        setLoading(false);
        setNotificationsLoading(false);
        return;
      }

      setRoomInfo(dashResult.data?.roomInfo ?? null);
      setUnpaidInvoices(dashResult.data?.unpaidInvoices ?? []);
      setError(null);
      setLoading(false);

      if (notifResult.success) {
        setNotifications(notifResult.data ?? []);
      }
      setNotificationsLoading(false);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const code = searchParams.get("code");
    const invoiceId = searchParams.get("invoiceId");

    if (!payment) {
      return;
    }

    if (payment === "success") {
      setPaymentMessage(
        invoiceId
          ? `Thanh toán thành công cho hóa đơn ${invoiceId}.`
          : "Thanh toán thành công."
      );
      setError(null);
    } else {
      setError(
        code
          ? `Thanh toán thất bại (mã: ${code}). Vui lòng thử lại.`
          : "Thanh toán thất bại. Vui lòng thử lại."
      );
    }

    router.replace("/dashboard/tenant");
  }, [searchParams, router]);

  const outstandingAmount = useMemo(
    () =>
      unpaidInvoices.reduce((sum, invoice) => {
        if (invoice.status === "PARTIAL") {
          return sum + Math.max(0, invoice.totalAmount - invoice.paidAmount);
        }
        return sum + invoice.totalAmount;
      }, 0),
    [unpaidInvoices]
  );

  const aiStats = useMemo(() => {
    const contractStatus = roomInfo ? "ACTIVE" : "NO_ACTIVE_CONTRACT";

    return {
      roomInfo,
      contractStatus,
      unpaidInvoices,
      totalUnpaidInvoices: unpaidInvoices.length,
      outstandingAmount,
    };
  }, [roomInfo, unpaidInvoices, outstandingAmount]);

  const handleConfirmPayment = async () => {
    if (unpaidInvoices.length === 0) {
      setShowQRCode(false);
      return;
    }

    setPaymentProcessing(true);
    setPaymentMessage(null);
    setError(null);

    const invoiceToPay = unpaidInvoices[0];
    const result = await createVnpayPaymentUrl(invoiceToPay.id, undefined, "dashboard");

    if (!result.success || !result.data?.paymentUrl) {
      setError(result.error ?? `Không thể khởi tạo thanh toán hóa đơn ${invoiceToPay.id}`);
      setPaymentProcessing(false);
      return;
    }

    window.location.href = result.data.paymentUrl;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng Quan</h1>
          <p className="text-muted-foreground mt-1">
            Xem thông tin phòng và quản lý hóa đơn của bạn.
          </p>
        </div>
      </header>

      {!loading && !error && <AIOverview stats={aiStats} />}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Thông báo quan trọng</h2>
          <NotificationsList
            notifications={notifications}
            loading={notificationsLoading}
            onDismiss={(id) => {
              setNotifications(notifications.filter(n => n.id !== id));
            }}
          />
        </div>
      )}

      {paymentMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-green-700">{paymentMessage}</p>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !roomInfo && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">
            Hiện tại bạn chưa có hợp đồng thuê đang hiệu lực.
          </p>
        </div>
      )}

      {/* Room Information Card */}
      {roomInfo && (
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
      )}

      {/* Unpaid Invoices Alert */}
      {!loading && unpaidInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900">
                Có {unpaidInvoices.length} hóa đơn chưa thanh toán
              </h3>
              <p className="text-red-700 text-sm mt-2">
                Vui lòng thanh toán các hóa đơn để tránh bị ngắt nước/điện.
              </p>
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <button
                  onClick={() => setShowQRCode(true)}
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
      )}

      {/* Unpaid Invoices Summary */}
      {!loading && unpaidInvoices.length > 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold text-lg text-foreground">
              Hóa đơn cần thanh toán
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {unpaidInvoices.map((invoice) => (
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
                      {invoice.status === "UNPAID"
                        ? "Chưa thanh toán"
                        : "Thanh toán một phần"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                Mã QR thanh toán
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
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
                onClick={() => void handleConfirmPayment()}
                disabled={paymentProcessing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
              </button>
              <button
                onClick={() => setShowQRCode(false)}
                disabled={paymentProcessing}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantDashboard() {
  return (
    <Suspense fallback={null}>
      <TenantDashboardContent />
    </Suspense>
  );
}