// app/dashboard/tenant/contracts/page.tsx
"use client";

import { BookOpen, Download } from "lucide-react";

export default function TenantContracts() {
  // Mock data - later replace with actual data from API
  const contracts = [
    {
      id: "CT-2024-001",
      roomName: "Phòng 101",
      property: "Khu trọ Đường Tây Sơn",
      landlord: "Nguyễn Văn A",
      startDate: "2024-06-01",
      endDate: "2025-06-01",
      status: "ACTIVE",
      deposit: 5000000,
      roomPrice: 3500000,
      terms: "Hợp đồng 12 tháng, thanh toán hàng tháng vào ngày 1",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hợp đồng của tôi</h1>
          <p className="text-muted-foreground mt-1">Xem thông tin và tải về hợp đồng thuê phòng.</p>
        </div>
      </header>

      {/* Contracts List */}
      <div className="space-y-6">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{contract.roomName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{contract.property}</p>
                    <p className="text-sm text-muted-foreground">Mã hợp đồng: {contract.id}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex-shrink-0">
                  {contract.status === "ACTIVE" ? "Đang hoạt động" : "Hết hạn"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Chủ trọ</p>
                  <p className="font-medium text-foreground mt-2">{contract.landlord}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời hạn</p>
                  <p className="font-medium text-foreground mt-2">
                    {contract.startDate} đến {contract.endDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
                  <p className="font-medium text-foreground mt-2">3 tháng 25 ngày</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá thuê hàng tháng</p>
                  <p className="font-medium text-foreground mt-2">
                    {contract.roomPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiền cọc</p>
                  <p className="font-medium text-foreground mt-2">
                    {contract.deposit.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điều khoản chính</p>
                  <p className="font-medium text-foreground mt-2 text-sm">{contract.terms}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  <Download className="w-5 h-5" />
                  Tải hợp đồng PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
