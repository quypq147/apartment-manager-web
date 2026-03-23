"use client";

import { FormEvent, useState } from "react";
import { Monitor, ShieldCheck, Bell, Settings } from "lucide-react";
import ThemeToggleWithIcon from "@/components/toggle";

type SettingsPageProps = {
  title: string;
  description: string;
  roleNoteTitle: string;
  roleNotes: string[];
};

export function DashboardSettingsPage({
  title,
  description,
  roleNoteTitle,
  roleNotes,
}: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Không thể đổi mật khẩu");
        setLoading(false);
        return;
      }

      setSuccessMessage(result.message || "Đổi mật khẩu thành công");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Giao diện
            </h2>
            <p className="text-sm text-muted-foreground">
              Chuyển đổi giữa chế độ sáng và tối. Cài đặt được lưu trên trình
              duyệt hiện tại.
            </p>
          </div>
        </div>

        <ThemeToggleWithIcon />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {roleNoteTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Khu vực này là khung mở rộng cho cài đặt theo vai trò.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {roleNotes.map((note) => (
            <li
              key={note}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            >
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <Bell className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Thông báo
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Mục cài đặt thông báo sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Bảo mật
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Đổi mật khẩu cho tài khoản đang đăng nhập.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-blue-600"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-blue-600"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-blue-600"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
}
