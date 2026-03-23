"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Không thể đặt lại mật khẩu");
        setLoading(false);
        return;
      }

      setSuccessMessage(result.message || "Đặt lại mật khẩu thành công");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login?message=Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");
      }, 1200);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Quay lại{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
