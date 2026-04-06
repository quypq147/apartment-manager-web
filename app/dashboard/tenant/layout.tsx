// app/dashboard/tenant/layout.tsx
"use client";

import Link from "next/link";
import { 
  Home, 
  FileText, 
  BookOpen, 
  BedDouble,
  Wrench,
  Settings, 
  Menu
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { ChatBot } from "@/components/chat-bot";
import { LogoutButton } from "@/components/logout-button";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col text-foreground md:flex-row bg-background">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed z-10 hidden h-full w-64 flex-col border-r border-border bg-card shadow-sm md:flex">
        <div className="border-b border-border p-6">
          <Link href="/dashboard/tenant" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <h2 className="text-xl font-bold text-card-foreground">HomeManager</h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4 mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tài khoản tôi
          </div>
          
          <NavLink
            href="/dashboard/tenant"
            icon={<Home className="w-5 h-5" />}
            exact
          >
            Tổng quan
          </NavLink>
          <NavLink
            href="/dashboard/tenant/invoices"
            icon={<FileText className="w-5 h-5" />}
          >
            Hóa đơn của tôi
          </NavLink>
          <NavLink
            href="/dashboard/tenant/contracts"
            icon={<BookOpen className="w-5 h-5" />}
          >
            Hợp đồng
          </NavLink>
          <NavLink
            href="/dashboard/tenant/room"
            icon={<BedDouble className="w-5 h-5" />}
          >
            Quản lý phòng
          </NavLink>
          <NavLink
            href="/dashboard/tenant/services"
            icon={<Wrench className="w-5 h-5" />}
          >
            Quản lý dịch vụ
          </NavLink>

          <div className="mb-4 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hệ thống
          </div>
          <NavLink
            href="/dashboard/tenant/settings"
            icon={<Settings className="w-5 h-5" />}
          >
            Cài đặt
          </NavLink>
        </nav>

        <div className="border-t border-border p-4">
          <LogoutButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/40" />
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

      <ChatBot />
    </div>
  );
}
