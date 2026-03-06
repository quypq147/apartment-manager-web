"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { getInvoices, payInvoice, type OwnerInvoice } from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

function getPaidAmount(invoice: OwnerInvoice) {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export default function InvoicesPage() {
  const now = new Date();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [invoices, setInvoices] = useState<OwnerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    const result = await getInvoices({ month, year });

    if (!result.success) {
      setError(result.error ?? "Không thể tải hóa đơn");
      setLoading(false);
      return;
    }

    setInvoices(result.data ?? []);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadByPeriod = async () => {
      const result = await getInvoices({ month, year });

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Không thể tải hóa đơn");
        setLoading(false);
        return;
      }

      setInvoices(result.data ?? []);
      setError(null);
      setLoading(false);
    };

    void loadByPeriod();

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const handlePay = async (invoiceId: string, remaining: number) => {
    if (remaining <= 0) {
      return;
    }

    const raw = window.prompt(
      `Nhập số tiền cần thu (tối đa ${remaining.toLocaleString("vi-VN")})`,
      String(remaining)
    );

    if (!raw) {
      return;
    }

    const amount = Number(raw);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }

    setPayingInvoiceId(invoiceId);
    setMessage(null);
    setError(null);
    const result = await payInvoice(invoiceId, amount);

    if (!result.success) {
      setError(result.error ?? "Không thể ghi nhận thanh toán");
      setPayingInvoiceId(null);
      return;
    }

    setMessage("Ghi nhận thu tiền thành công");
    setPayingInvoiceId(null);
    await loadInvoices();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return invoices;
    }

    const keyword = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      return (
        invoice.contract.room.name.toLowerCase().includes(keyword) ||
        invoice.contract.tenant.name.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword)
      );
    });
  }, [invoices, search]);

  const summary = useMemo(() => {
    const total = filtered.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paid = filtered.reduce((sum, invoice) => sum + getPaidAmount(invoice), 0);
    return {
      total,
      paid,
      remaining: Math.max(total - paid, 0),
    };
  }, [filtered]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hóa Đơn & Thu Tiền</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý chốt điện nước, xuất hóa đơn và theo dõi công nợ.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tổng dự thu (tháng hiện tại)</p>
            <p className="text-2xl font-bold text-foreground mt-1">{currency.format(summary.total)} đ</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Đã thu được</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{currency.format(summary.paid)} đ</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Còn phải thu</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{currency.format(summary.remaining)} đ</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã phòng, tên khách..."
            className="w-full pl-9 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-background text-foreground"
          />
        </div>
        <select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <option key={index + 1} value={index + 1}>
              Tháng {index + 1}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
        >
          {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((value) => (
            <option key={value} value={value}>
              Năm {value}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Phòng / Khách</th>
              <th className="px-6 py-4 font-medium">Tổng tiền</th>
              <th className="px-6 py-4 font-medium">Đã thanh toán</th>
              <th className="px-6 py-4 font-medium">Còn nợ</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-sm text-muted-foreground" colSpan={6}>
                  Không có hóa đơn trong kỳ này.
                </td>
              </tr>
            )}

            {filtered.map((invoice) => {
              const paid = getPaidAmount(invoice);
              const remaining = Math.max(invoice.totalAmount - paid, 0);

              return (
                <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-card-foreground">
                        {invoice.contract.room.name}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{invoice.contract.tenant.name}</div>
                        <div className="text-xs text-muted-foreground">HD: {invoice.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{currency.format(invoice.totalAmount)} đ</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{currency.format(paid)} đ</td>
                  <td className="px-6 py-4 font-medium text-amber-600">{currency.format(remaining)} đ</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "PARTIAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {invoice.status === "PAID"
                        ? "Đã thanh toán"
                        : invoice.status === "PARTIAL"
                          ? "Đóng thiếu"
                          : "Chưa đóng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {remaining > 0 && (
                      <button
                        onClick={() => handlePay(invoice.id, remaining)}
                        disabled={payingInvoiceId === invoice.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                        title="Ghi nhận thu tiền"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        {payingInvoiceId === invoice.id ? "Đang thu..." : "Thu tiền"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}