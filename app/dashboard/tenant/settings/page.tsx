import { DashboardSettingsPage } from "@/components/dashboard/settings/settings-page";

export default function TenantSettingsPage() {
  return (
    <DashboardSettingsPage
      title="Cài đặt tài khoản Khách thuê"
      description="Quản lý giao diện và các tùy chọn liên quan đến việc thuê phòng."
      roleNoteTitle="Mở rộng cho Khách thuê"
      roleNotes={[
        "Tùy chỉnh cách nhận thông báo hạn thanh toán hóa đơn.",
        "Chọn kênh ưu tiên khi liên hệ với chủ trọ.",
      ]}
    />
  );
}
