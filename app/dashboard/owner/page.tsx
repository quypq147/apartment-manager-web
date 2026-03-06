"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, PieChart, DollarSign, AlertCircle } from "lucide-react";
import {
  getInvoices,
  getProperties,
  getTenants,
  type OwnerInvoice,
  type OwnerProperty,
  type OwnerTenantContract,
} from "@/lib/api/owner";

const currency = new Intl.NumberFormat("vi-VN");

function getPaid(invoice: OwnerInvoice) {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [contracts, setContracts] = useState<OwnerTenantContract[]>([]);
  const [invoices, setInvoices] = useState<OwnerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();

    const load = async () => {
      setLoading(true);
      const [propertiesRes, tenantsRes, invoicesRes] = await Promise.all([
        getProperties(),
        getTenants(),
        getInvoices({ month: now.getMonth() + 1, year: now.getFullYear() }),
      ]);

      if (!propertiesRes.success || !tenantsRes.success || !invoicesRes.success) {
        setError("Khong the tai du lieu tong quan");
        setLoading(false);
        return;
      }

      setProperties(propertiesRes.data ?? []);
      setContracts(tenantsRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);
      setError(null);
      setLoading(false);
    };

    void load();
  }, []);

  const stats = useMemo(() => {
    const totalRooms = properties.reduce((sum, property) => sum + property.rooms.length, 0);
    const rentedRooms = properties.reduce(
      (sum, property) =>
        sum + property.rooms.filter((room) => room.status === "RENTED").length,
      0
    );
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    const unpaidInvoices = invoices.filter(
      (invoice) => invoice.status === "UNPAID" || invoice.status === "PARTIAL"
    );

    const waitingAmount = unpaidInvoices.reduce(
      (sum, invoice) => sum + Math.max(invoice.totalAmount - getPaid(invoice), 0),
      0
    );

    const paidAmount = invoices.reduce((sum, invoice) => sum + getPaid(invoice), 0);

    return {
      totalRooms,
      rentedRooms,
      occupancyRate,
      waitingAmount,
      paidAmount,
      unpaidInvoices,
    };
  }, [invoices, properties]);

  const expiringContracts = useMemo(() => {
    const today = new Date();

    return contracts
      .filter((contract) => contract.status === "ACTIVE" && contract.endDate)
      .map((contract) => {
        const endDate = new Date(contract.endDate as string);
        const diff = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...contract,
          daysLeft: diff,
        };
      })
      .filter((contract) => contract.daysLeft >= 0 && contract.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [contracts]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tong Quan</h1>
          <p className="text-gray-500 mt-1">Theo doi tinh hinh hoat dong cac khu tro cua ban.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/owner/invoices"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Ghi dien nuoc
          </Link>
          <Link
            href="/dashboard/owner/invoices"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
          >
            + Tao hoa don moi
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-gray-500">Dang tai du lieu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Tong so phong</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalRooms}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Ty le lap day</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.occupancyRate}%</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.rentedRooms}/{stats.totalRooms} phong dang thue
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Cho thu thang nay</h3>
            <p className="text-3xl font-bold mt-2 text-amber-500">{currency.format(stats.waitingAmount)}</p>
            <p className="text-sm text-gray-400 mt-1">{stats.unpaidInvoices.length} hoa don chua dong</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Da thu thang nay</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{currency.format(stats.paidAmount)}</p>
          </div>
          <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">Hoa don can thu</h3>
            <Link href="/dashboard/owner/invoices" className="text-sm text-blue-600 font-medium hover:underline">
              Xem tat ca
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.unpaidInvoices.slice(0, 5).map((invoice) => {
                const remaining = Math.max(invoice.totalAmount - getPaid(invoice), 0);

                return (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        {invoice.contract.room.name}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.contract.tenant.name}</p>
                        <p className="text-sm text-gray-500">{invoice.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{currency.format(remaining)} d</p>
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md mt-1">
                        {invoice.status === "PARTIAL" ? "Dong thieu" : "Chua thanh toan"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!loading && stats.unpaidInvoices.length === 0 && (
                <p className="text-sm text-gray-500">Khong co hoa don can thu.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">Hop dong sap het han</h3>
            <Link href="/dashboard/owner/tenants" className="text-sm text-blue-600 font-medium hover:underline">
              Quan ly
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {expiringContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {contract.room.name}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contract.tenant.name}</p>
                      <p className="text-sm text-red-500 font-medium">Het han trong {contract.daysLeft} ngay toi</p>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && expiringContracts.length === 0 && (
                <p className="text-sm text-gray-500">Khong co hop dong sap het han.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
