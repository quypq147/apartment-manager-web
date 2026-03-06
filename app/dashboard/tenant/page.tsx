// app/dashboard/tenant/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  AlertCircle,
  DollarSign,
  QrCode,
  X,
} from "lucide-react";

export default function TenantDashboard() {
  const [showQRCode, setShowQRCode] = useState(false);

  // Mock data - later replace with actual data from API
  const roomInfo = {
    name: "Phòng 101",
    property: "Khu trọ Đường Tây Sơn",
    address: "123 Đường Tây Sơn, Quận Đống Đa, Hà Nội",
    price: 3500000,
    area: 25,
    contractStartDate: "2024-06-01",
    contractEndDate: "2025-06-01",
  };

  const unpaidInvoices = [
    {
      id: "INV001",
      month: 3,
      year: 2026,
      totalAmount: 3500000,
      status: "UNPAID",
      dueDate: "2026-03-15",
    },
    {
      id: "INV002",
      month: 2,
      year: 2026,
      totalAmount: 3850000,
      status: "PARTIAL",
      paidAmount: 2000000,
      dueDate: "2026-02-15",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan</h1>
          <p className="text-gray-500 mt-1">
            Xem thông tin phòng và quản lý hóa đơn của bạn.
          </p>
        </div>
      </header>

      {/* Room Information Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{roomInfo.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{roomInfo.property}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium text-gray-900 mt-1">{roomInfo.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Diện tích</p>
              <p className="font-medium text-gray-900 mt-1">{roomInfo.area}m²</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Giá thuê hàng tháng</p>
              <p className="font-medium text-gray-900 mt-1">
                {roomInfo.price.toLocaleString("vi-VN")} đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Thời hạn hợp đồng</p>
              <p className="font-medium text-gray-900 mt-1">
                {roomInfo.contractStartDate} đến {roomInfo.contractEndDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Invoices Alert */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
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
      {unpaidInvoices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">
              Hóa đơn cần thanh toán
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {unpaidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                      {invoice.month}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Hóa đơn tháng {invoice.month}/{invoice.year}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hạn chót: {invoice.dueDate}
                      </p>
                      {invoice.status === "PARTIAL" && (
                        <p className="text-sm text-blue-600 font-medium">
                          Đã thanh toán: {invoice.paidAmount?.toLocaleString("vi-VN")} đ
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Mã QR thanh toán
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-white" />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Tổng số tiền cần thanh toán</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600">
                  📱 Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQRCode(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}