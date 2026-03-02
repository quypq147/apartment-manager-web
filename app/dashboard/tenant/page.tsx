export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Manage your apartment here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Next Rent Due</h3>
            <p className="text-4xl font-bold mt-2 text-gray-900">$850</p>
            <p className="text-sm text-amber-600 mt-2 font-medium">Due in 5 days</p>
          </div>
          <button className="mt-6 w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
            Pay Rent Now
          </button>
        </div>

        {/* Maintenance Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-500">Maintenance Requests</h3>
            <p className="text-gray-600 mt-2 text-sm">Everything looking good. No active requests.</p>
          </div>
          <button className="mt-6 w-full px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
            Submit New Request
          </button>
        </div>
      </div>
    </div>
  );
}