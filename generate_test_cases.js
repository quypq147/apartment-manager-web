const fs = require('fs');

const testCases = [
  // --- MODULE AUTHENTICATION (Xác thực) ---
  { id: 'TC_AUTH_01', module: 'Auth', name: 'Đăng nhập thành công với tài khoản Owner', steps: '1. Nhập email/pass hợp lệ của Owner\n2. Click Đăng nhập', expected: 'Chuyển hướng đến /dashboard/owner' },
  { id: 'TC_AUTH_02', module: 'Auth', name: 'Đăng nhập thành công với tài khoản Tenant', steps: '1. Nhập email/pass hợp lệ của Tenant\n2. Click Đăng nhập', expected: 'Chuyển hướng đến /dashboard/tenant' },
  { id: 'TC_AUTH_03', module: 'Auth', name: 'Đăng nhập thành công với tài khoản Admin', steps: '1. Nhập email/pass hợp lệ của Admin\n2. Click Đăng nhập', expected: 'Chuyển hướng đến /dashboard/admin' },
  { id: 'TC_AUTH_04', module: 'Auth', name: 'Đăng nhập thất bại do sai mật khẩu', steps: '1. Nhập đúng email, sai mật khẩu\n2. Click Đăng nhập', expected: 'Hiển thị lỗi "Thông tin đăng nhập không chính xác"' },
  { id: 'TC_AUTH_05', module: 'Auth', name: 'Đăng nhập thất bại do email không tồn tại', steps: '1. Nhập email chưa đăng ký\n2. Click Đăng nhập', expected: 'Hiển thị lỗi "Tài khoản không tồn tại"' },
  { id: 'TC_AUTH_06', module: 'Auth', name: 'Đăng ký tài khoản Owner mới', steps: '1. Nhập thông tin hợp lệ\n2. Chọn role Owner\n3. Click Đăng ký', expected: 'Tạo tài khoản thành công và chuyển đến trang đăng nhập' },
  { id: 'TC_AUTH_07', module: 'Auth', name: 'Đăng ký thất bại do trùng email', steps: '1. Nhập email đã tồn tại\n2. Click Đăng ký', expected: 'Báo lỗi "Email đã được sử dụng"' },
  { id: 'TC_AUTH_08', module: 'Auth', name: 'Quên mật khẩu - Gửi link thành công', steps: '1. Nhập email hợp lệ\n2. Click Quên mật khẩu', expected: 'Gửi email chứa link reset password thành công' },
  { id: 'TC_AUTH_09', module: 'Auth', name: 'Reset mật khẩu thành công', steps: '1. Truy cập link reset\n2. Nhập mật khẩu mới', expected: 'Đổi mật khẩu thành công, yêu cầu đăng nhập lại' },
  { id: 'TC_AUTH_10', module: 'Auth', name: 'Đăng xuất tài khoản', steps: '1. Click avatar\n2. Chọn Đăng xuất', expected: 'Xóa session/cookie và chuyển về trang Login' },

  // --- MODULE PHÂN QUYỀN (Authorization) ---
  { id: 'TC_AUTHZ_01', module: 'Authorization', name: 'Tenant truy cập route của Owner', steps: '1. Đăng nhập Tenant\n2. Truy cập URL /dashboard/owner', expected: 'Chuyển hướng về trang 404 hoặc báo lỗi không có quyền' },
  { id: 'TC_AUTHZ_02', module: 'Authorization', name: 'Truy cập dashboard khi chưa đăng nhập', steps: '1. Không đăng nhập\n2. Vào URL /dashboard/tenant', expected: 'Chuyển hướng về /login' },

  // --- MODULE OWNER - QUẢN LÝ TÀI SẢN (Properties) ---
  { id: 'TC_OWN_PROP_01', module: 'Owner/Properties', name: 'Xem danh sách tài sản', steps: '1. Truy cập /dashboard/owner/properties', expected: 'Hiển thị danh sách các tòa nhà/dãy trọ của Owner' },
  { id: 'TC_OWN_PROP_02', module: 'Owner/Properties', name: 'Thêm tài sản mới thành công', steps: '1. Click "Thêm tài sản"\n2. Điền tên, địa chỉ\n3. Lưu', expected: 'Tài sản mới xuất hiện trong danh sách' },
  { id: 'TC_OWN_PROP_03', module: 'Owner/Properties', name: 'Thêm tài sản bỏ trống trường bắt buộc', steps: '1. Bỏ trống Tên tài sản\n2. Lưu', expected: 'Hiển thị lỗi validation yêu cầu nhập Tên' },
  { id: 'TC_OWN_PROP_04', module: 'Owner/Properties', name: 'Chỉnh sửa thông tin tài sản', steps: '1. Click Edit\n2. Đổi tên\n3. Lưu', expected: 'Thông tin tài sản được cập nhật trên UI và Database' },
  { id: 'TC_OWN_PROP_05', module: 'Owner/Properties', name: 'Xóa tài sản chưa có phòng', steps: '1. Click Delete tài sản trống\n2. Xác nhận', expected: 'Xóa thành công khỏi danh sách' },

  // --- MODULE OWNER - QUẢN LÝ PHÒNG (Rooms) ---
  { id: 'TC_OWN_ROOM_01', module: 'Owner/Rooms', name: 'Xem danh sách phòng của 1 tài sản', steps: '1. Chọn 1 tài sản\n2. Xem danh sách phòng', expected: 'Hiển thị các phòng thuộc tài sản đó' },
  { id: 'TC_OWN_ROOM_02', module: 'Owner/Rooms', name: 'Thêm phòng mới', steps: '1. Nhập số phòng, diện tích, giá thuê\n2. Lưu', expected: 'Phòng mới được tạo thành công' },
  { id: 'TC_OWN_ROOM_03', module: 'Owner/Rooms', name: 'Cập nhật trạng thái phòng', steps: '1. Đổi trạng thái từ Trống sang Đang thuê\n2. Lưu', expected: 'Trạng thái phòng hiển thị đúng trên UI' },

  // --- MODULE OWNER - DỊCH VỤ (Services) ---
  { id: 'TC_OWN_SVC_01', module: 'Owner/Services', name: 'Thêm dịch vụ mới (Điện, Nước, Rác)', steps: '1. Vào menu Dịch vụ\n2. Thêm Điện, giá 3500, đơn vị kWh\n3. Lưu', expected: 'Dịch vụ được thêm thành công' },
  { id: 'TC_OWN_SVC_02', module: 'Owner/Services', name: 'Gán dịch vụ cho phòng', steps: '1. Chọn phòng\n2. Tick chọn dịch vụ Điện, Nước\n3. Lưu', expected: 'Phòng được liên kết với các dịch vụ đã chọn' },

  // --- MODULE OWNER - HỢP ĐỒNG (Contracts) ---
  { id: 'TC_OWN_CON_01', module: 'Owner/Contracts', name: 'Tạo hợp đồng thuê phòng', steps: '1. Chọn phòng Trống\n2. Nhập thông tin Tenant\n3. Nhập ngày bắt đầu/kết thúc, tiền cọc\n4. Tạo hợp đồng', expected: 'Hợp đồng được tạo, trạng thái phòng chuyển sang Đang thuê' },
  { id: 'TC_OWN_CON_02', module: 'Owner/Contracts', name: 'Xem chi tiết hợp đồng', steps: '1. Click vào mã hợp đồng', expected: 'Hiển thị đầy đủ thông tin: Người thuê, Giá, Cọc, Ngày hạn' },
  { id: 'TC_OWN_CON_03', module: 'Owner/Contracts', name: 'Chấm dứt hợp đồng trước hạn', steps: '1. Chọn hợp đồng đang active\n2. Click Chấm dứt\n3. Xác nhận', expected: 'Trạng thái HĐ thành "Terminated", phòng về trạng thái "Trống"' },

  // --- MODULE OWNER - HÓA ĐƠN (Invoices) ---
  { id: 'TC_OWN_INV_01', module: 'Owner/Invoices', name: 'Tạo hóa đơn hàng tháng', steps: '1. Chọn phòng\n2. Nhập chỉ số điện/nước mới\n3. Tạo hóa đơn', expected: 'Hệ thống tự tính toán tổng tiền và tạo hóa đơn trạng thái Unpaid' },
  { id: 'TC_OWN_INV_02', module: 'Owner/Invoices', name: 'Xác nhận thanh toán thủ công (Tiền mặt)', steps: '1. Chọn hóa đơn Unpaid\n2. Click Đã thu tiền', expected: 'Trạng thái chuyển sang Paid' },

  // --- MODULE TENANT (Người thuê) ---
  { id: 'TC_TEN_DASH_01', module: 'Tenant/Dashboard', name: 'Xem tổng quan Dashboard', steps: '1. Đăng nhập Tenant\n2. Vào Dashboard', expected: 'Hiển thị số tiền nợ, phòng đang thuê, thông báo mới' },
  { id: 'TC_TEN_ROOM_01', module: 'Tenant/Room', name: 'Xem thông tin phòng', steps: '1. Vào menu Phòng của tôi', expected: 'Hiển thị đúng thông tin phòng đang thuê' },
  { id: 'TC_TEN_INV_01', module: 'Tenant/Invoices', name: 'Xem danh sách hóa đơn', steps: '1. Vào menu Hóa đơn', expected: 'Liệt kê các hóa đơn tháng, phân biệt rõ Paid và Unpaid' },

  // --- MODULE THANH TOÁN VNPAY ---
  { id: 'TC_PAY_VN_01', module: 'Payment/VNPay', name: 'Tạo URL thanh toán VNPay', steps: '1. Tenant chọn Hóa đơn chưa thanh toán\n2. Click "Thanh toán VNPay"', expected: 'Chuyển hướng đến cổng thanh toán VNPay (sandbox)' },
  { id: 'TC_PAY_VN_02', module: 'Payment/VNPay', name: 'Thanh toán VNPay thành công', steps: '1. Nhập thẻ test VNPay\n2. Thanh toán\n3. Redirect về trang Return', expected: 'Hệ thống gọi IPN, cập nhật trạng thái hóa đơn thành Paid, hiển thị màn hình thành công' },
  { id: 'TC_PAY_VN_03', module: 'Payment/VNPay', name: 'Hủy thanh toán VNPay', steps: '1. Tại cổng VNPay click Hủy', expected: 'Redirect về ứng dụng, báo lỗi hủy thanh toán, hóa đơn vẫn Unpaid' },

  // --- MODULE AI & CHATBOT ---
  { id: 'TC_AI_01', module: 'AI', name: 'Mở cửa sổ Chatbot', steps: '1. Click icon Chat ở góc màn hình', expected: 'Cửa sổ chat mở ra, hiển thị tin nhắn chào mừng' },
  { id: 'TC_AI_02', module: 'AI', name: 'Hỏi AI về tính năng hệ thống', steps: '1. Gõ "Làm sao để tạo hợp đồng?"\n2. Gửi', expected: 'AI (Gemini) trả về câu trả lời hướng dẫn sử dụng' },
  { id: 'TC_AI_03', module: 'AI', name: 'AI Overview - Tổng quan Dashboard', steps: '1. Chủ nhà truy cập Dashboard\n2. Click "Phân tích AI"', expected: 'Hệ thống gọi API /api/ai/overview và hiển thị nhận xét về doanh thu' },

  // --- GIAO DIỆN & UI/UX ---
  { id: 'TC_UI_01', module: 'UI', name: 'Chuyển đổi Dark/Light mode', steps: '1. Click icon Theme Toggle', expected: 'Giao diện đổi màu mượt mà theo chế độ Dark/Light' },
  { id: 'TC_UI_02', module: 'UI', name: 'Responsive trên Mobile', steps: '1. Thu nhỏ trình duyệt về kích thước mobile', expected: 'Sidebar chuyển thành menu Hamburger, các bảng dữ liệu có scroll ngang' }
];

// Sinh thêm data cho đủ ~100 test case (các thao tác CRUD cơ bản và Edge cases)
const modules = ['Properties', 'Rooms', 'Contracts', 'Invoices', 'Services', 'Tenants'];
modules.forEach(mod => {
    ['Tìm kiếm', 'Phân trang', 'Lọc theo trạng thái', 'Kiểm tra SQL Injection', 'Kiểm tra XSS trên input'].forEach((action, idx) => {
        testCases.push({
            id: `TC_EDGE_${mod.substring(0,3).toUpperCase()}_0${idx+1}`,
            module: `Owner/${mod}`,
            name: `${action} trên danh sách ${mod}`,
            steps: `Thực hiện ${action.toLowerCase()} trên UI`,
            expected: 'Hệ thống xử lý đúng, không bị lỗi, không dính bảo mật'
        });
    });
});

// Chuyển mảng thành định dạng CSV
const header = "Mã TC,Module,Tên Test Case,Các bước thực hiện,Kết quả mong muốn\n";
const rows = testCases.map(tc => `"${tc.id}","${tc.module}","${tc.name}","${tc.steps.replace(/\n/g, ' ')}","${tc.expected}"`).join('\n');
const csvContent = '\uFEFF' + header + rows; // \uFEFF là BOM để Excel đọc được tiếng Việt (UTF-8)

fs.writeFileSync('Test_Cases_Apartment_Manager.csv', csvContent, 'utf8');
console.log('✅ Đã tạo file Test_Cases_Apartment_Manager.csv thành công! (Tổng cộng: ' + testCases.length + ' test cases)');