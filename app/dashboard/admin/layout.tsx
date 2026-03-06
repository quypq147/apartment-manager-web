// app/dashboard/admin/layout.tsx
import Link from "next/link";
import {
  Home,
  Users,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <h2 className="text-xl font-bold text-gray-900">HomeManager</h2>
          </Link>
          <p className="text-xs text-gray-500 mt-2">Quản trị viên hệ thống</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">
            Quản lý hệ thống
          </div>

          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-3 py-2.5 text-purple-700 bg-purple-50 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Tổng quan
          </Link>
          <Link
            href="/dashboard/admin/landlords"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors"
          >
            <Users className="w-5 h-5" />
            Quản lý Chủ trọ
          </Link>
          <Link
            href="/dashboard/admin/revenue"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Thống kê doanh thu
          </Link>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">
            Hệ thống
          </div>
          <Link
            href="/dashboard/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            Cài đặt
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-bold text-purple-600">HomeManager</h2>
          <button className="p-2 text-gray-600 bg-gray-100 rounded-md">
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
