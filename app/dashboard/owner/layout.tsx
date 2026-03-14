// app/dashboard/owner/layout.tsx
"use client";

import Link from "next/link";
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  Wrench,
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { NavLink } from "@/components/nav-link";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col text-foreground md:flex-row bg-background">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed z-10 hidden h-full w-64 flex-col border-r border-border bg-card shadow-sm md:flex">
        <div className="border-b border-border p-6">
          <Link href="/dashboard/owner" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <h2 className="text-xl font-bold text-card-foreground">HomeManager</h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4 mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quản lý chính
          </div>
          
          <NavLink
            href="/dashboard/owner"
            icon={<Home className="w-5 h-5" />}
            exact
          >
            Tổng quan
          </NavLink>
          <NavLink
            href="/dashboard/owner/properties"
            icon={<Building className="w-5 h-5" />}
          >
            Khu trọ & Phòng
          </NavLink>
          <NavLink
            href="/dashboard/owner/contracts"
            icon={<FileText className="w-5 h-5" />}
          >
            Hợp đồng 
          </NavLink>
          <NavLink
            href="/dashboard/owner/tenants"
            icon={<Users className="w-5 h-5" />}
          >
            Khách thuê
          </NavLink>
          <NavLink
            href="/dashboard/owner/invoices"
            icon={<FileText className="w-5 h-5" />}
          >
            Hóa đơn
          </NavLink>
          <NavLink
            href="/dashboard/owner/services"
            icon={<Wrench className="w-5 h-5" />}
          >
            Dịch vụ
          </NavLink>

          <div className="mb-4 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hệ thống
          </div>
          <NavLink
            href="/dashboard/owner/settings"
            icon={<Settings className="w-5 h-5" />}
          >
            Cài đặt
          </NavLink>
        </nav>

        <div className="border-t border-border p-4">
          <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header (hiển thị trên màn nhỏ) */}
        <header className="flex items-center justify-between border-b border-border bg-card p-4 md:hidden">
          <h2 className="text-lg font-bold text-blue-600">HomeManager</h2>
          <button className="rounded-md bg-muted p-2 text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}