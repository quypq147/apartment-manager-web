// app/dashboard/owner/layout.tsx
import Link from "next/link";
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react"; // Import icon (nhớ cài lucide-react)

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard/owner" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <h2 className="text-xl font-bold text-gray-900">HomeManager</h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">
            Quản lý chính
          </div>
          
          <Link href="/dashboard/owner" className="flex items-center gap-3 px-3 py-2.5 text-blue-700 bg-blue-50 rounded-lg font-medium transition-colors">
            <Home className="w-5 h-5" />
            Tổng quan
          </Link>
          <Link href="/dashboard/owner/properties" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
            <Building className="w-5 h-5" />
            Khu trọ & Phòng
          </Link>
          <Link href="/dashboard/owner/tenants" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
            <Users className="w-5 h-5" />
            Khách thuê
          </Link>
          <Link href="/dashboard/owner/invoices" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
            <FileText className="w-5 h-5" />
            Hóa đơn
          </Link>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">
            Hệ thống
          </div>
          <Link href="/dashboard/owner/settings" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Cài đặt
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header (hiển thị trên màn nhỏ) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-bold text-blue-600">HomeManager</h2>
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