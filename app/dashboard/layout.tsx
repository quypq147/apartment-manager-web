import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-blue-600 mb-8">AptManager</h2>
        <nav className="space-y-3">
          {/* In a real app, you would conditionally render these based on the user's role */}
          <Link href="/dashboard/owner" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            Owner View
          </Link>
          <Link href="/dashboard/tenant" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            Tenant View
          </Link>
          <Link href="/login" className="block px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-8">
            Log Out
          </Link>
        </nav>
      </aside>
      
      {/* Main Page Content */}
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}