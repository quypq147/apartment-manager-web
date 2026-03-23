import { DashboardSettingsPage } from "@/components/dashboard/settings/settings-page";

export default function OwnerSettingsPage() {
  return (
    <DashboardSettingsPage
      title="Cài đặt tài khoản Chủ trọ"
      description="Tùy chỉnh giao diện và các tùy chọn quản lý khu trọ của bạn."
      roleNoteTitle="Mở rộng cho Chủ trọ"
      roleNotes={[
        "Đặt quy tắc mặc định khi tạo hóa đơn mới.",
        "Cấu hình nhắc nhở thu tiền theo kỳ thanh toán.",
      ]}
    />
  );
}
