// app/dashboard/tenant/invoices/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getTenantInvoices, type TenantInvoice } from "@/lib/api/tenant";
import { FileText, Filter, Download } from "lucide-react";

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

export default function TenantInvoices() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const result = await getTenantInvoices();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Không thể tải danh sách hóa đơn");
        setLoading(false);
        return;
      }

      setInvoices(result.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInvoices = useMemo(
    () => (selectedStatus === "all" ? invoices : invoices.filter((inv) => inv.status === selectedStatus)),
    [invoices, selectedStatus]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "UNPAID":
        return "bg-red-100 text-red-700";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
      case "PARTIAL":
        return "Thanh toán một phần";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hóa đơn của tôi</h1>
          <p className="text-muted-foreground mt-1">Xem lịch sử hóa đơn và tình trạng thanh toán.</p>
        </div>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <label className="text-sm font-medium text-card-foreground">Lọc theo trạng thái:</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Tất cả" },
            { value: "UNPAID", label: "Chưa thanh toán" },
            { value: "PARTIAL", label: "Thanh toán một phần" },
            { value: "PAID", label: "Đã thanh toán" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === option.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Mã hóa đơn
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Tháng/Năm
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Hạn thanh toán
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground font-medium">
                        Tháng {invoice.month}/{invoice.year}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground font-medium">
                        {invoice.totalAmount.toLocaleString("vi-VN")} đ
                      </p>
                      {invoice.status === "PARTIAL" && (
                        <p className="text-sm text-blue-600 mt-1">
                          Đã thanh toán: {invoice.paidAmount?.toLocaleString("vi-VN")} đ
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">Không có hóa đơn nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Section */}
      {filteredInvoices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistics */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-lg text-foreground mb-6">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                <span className="text-muted-foreground">Tổng dư nợ</span>
                <span className="font-bold text-lg text-red-600">
                  {(
                    filteredInvoices.reduce((sum, inv) => {
                      if (inv.status === "UNPAID") return sum + inv.totalAmount;
                      if (inv.status === "PARTIAL")
                        return sum + (inv.totalAmount - (inv.paidAmount || 0));
                      return sum;
                    }, 0)
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50">
                <span className="text-green-700">Đã thanh toán</span>
                <span className="font-bold text-lg text-green-600">
                  {(
                    filteredInvoices.reduce((sum, inv) => {
                      if (inv.status === "PAID") return sum + inv.totalAmount;
                      if (inv.status === "PARTIAL") return sum + (inv.paidAmount || 0);
                      return sum;
                    }, 0)
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
            </div>
          </div>

          {/* Recent Invoice Details */}
          {filteredInvoices[0] && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg text-foreground mb-6">Chi tiết hóa đơn gần nhất</h3>
              <div className="space-y-3 mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredInvoices[0].id}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Ngày lập: <span className="font-medium text-foreground">{formatDate(filteredInvoices[0].createdDate)}</span>
                </p>
                {filteredInvoices[0].paidDate && (
                  <p className="text-sm text-muted-foreground">
                    Ngày thanh toán: <span className="font-medium text-green-600">{formatDate(filteredInvoices[0].paidDate)}</span>
                  </p>
                )}
              </div>
              <div className="border-t border-border pt-4">
                <div className="space-y-2">
                  {filteredInvoices[0].items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">
                        {item.amount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <span className="font-medium text-foreground">Tổng cộng</span>
                  <span className="font-bold text-lg text-foreground">
                    {filteredInvoices[0].totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
