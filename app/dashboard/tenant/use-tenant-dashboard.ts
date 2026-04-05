"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createVnpayPaymentUrl,
  getTenantDashboard,
  getTenantNotifications,
  type TenantDashboardInvoice,
  type TenantNotification,
} from "@/lib/api/tenant";

export type TenantRoomInfo = {
  name: string;
  property: string;
  address: string;
  price: number;
  area: number | null;
  contractStartDate: string;
  contractEndDate: string | null;
};

export function useTenantDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<TenantRoomInfo | null>(null);
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

  const handleConfirmPayment = useCallback(async () => {
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
  }, [unpaidInvoices]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  return {
    showQRCode,
    setShowQRCode,
    loading,
    error,
    paymentProcessing,
    paymentMessage,
    roomInfo,
    unpaidInvoices,
    notifications,
    notificationsLoading,
    outstandingAmount,
    aiStats,
    handleConfirmPayment,
    dismissNotification,
  };
}
