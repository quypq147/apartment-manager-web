// app/page.tsx
import Link from "next/link";
// import prisma from "@/lib/prisma";

export default async function Home() {
  // const users = await prisma.user.findMany();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-linear-to-b from-blue-50 to-white">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <div className="max-w-200 mx-auto space-y-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900 font-(family-name:--font-geist-sans)">
              Quản lý nhà trọ <br className="hidden sm:block" />
              <span className="text-blue-600">Dễ dàng & Tự động hóa</span>
            </h1>
            
            <p className="mx-auto max-w-150 text-gray-600 md:text-xl leading-relaxed">
              Tạm biệt sổ sách thủ công. Quản lý phòng trống, tính tiền điện nước, xuất hóa đơn và theo dõi hợp đồng chỉ với vài cú click chuột.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
              >
                Dùng thử miễn phí
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg border border-gray-200 bg-white px-8 text-base font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 hover:text-blue-600"
              >
                Trải nghiệm Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section Placeholder */}
      <section id="features" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Tính năng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 border rounded-2xl bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">Chốt điện nước nhanh</h3>
              <p className="text-gray-600">Nhập chỉ số hàng tháng, hệ thống tự động tính toán thành tiền chính xác.</p>
            </div>
            <div className="p-6 border rounded-2xl bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">Quản lý hóa đơn</h3>
              <p className="text-gray-600">Theo dõi trạng thái thanh toán, gửi thông báo nhắc nhở qua Zalo/Email.</p>
            </div>
            <div className="p-6 border rounded-2xl bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">Lưu trữ hợp đồng</h3>
              <p className="text-gray-600">Cảnh báo hợp đồng sắp hết hạn, lưu trữ an toàn thông tin khách thuê.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}