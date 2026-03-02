export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chào Mừng Quay Trở Lại</h1>
          <p className="text-sm text-gray-500 mt-2">Đăng nhập vào hệ thống quản lý chung cư</p>
        </div>
        
        {/* Placeholder for a future form/Auth provider */}
        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Đăng Nhập Như Chủ Nhà
          </button>
          <button className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Đăng Nhập Là Người Thuê
          </button>
        </div>
      </div>
    </div>
  );
}