import { DashboardSettingsPage } from "@/components/dashboard/settings/settings-page";

export default function AdminSettingsPage() {
  return (
    <DashboardSettingsPage
      title="Cài đặt hệ thống"
      description="Quản lý giao diện và các tùy chỉnh dành cho quản trị viên."
      roleNoteTitle="Mở rộng cho Quản trị viên"
      roleNotes={[
        "Quản lý quy trình phê duyệt tài khoản chủ trọ.",
        "Theo dõi các chỉ số vận hành và chính sách toàn hệ thống.",
      ]}
    />
  );
}
