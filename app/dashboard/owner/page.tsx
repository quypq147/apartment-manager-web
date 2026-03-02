export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Trang Chủ Chủ Nhà</h1>
        <p className="text-gray-500 mt-1">Overview of your properties and revenue.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-500">Total Properties</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">4</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-500">Occupancy Rate</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">85%</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-500">Pending Rent</h3>
          <p className="text-3xl font-bold mt-2 text-red-500">$1,200</p>
        </div>
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Maintenance Requests</h3>
        <p className="text-gray-500 text-sm">No new requests at this time.</p>
      </div>
    </div>
  );
}