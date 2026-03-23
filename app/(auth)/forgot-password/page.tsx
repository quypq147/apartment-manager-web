"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Không thể gửi email đặt lại mật khẩu");
        setLoading(false);
        return;
      }

      setSuccessMessage(result.message || "Vui lòng kiểm tra email của bạn.");
      setEmail("");
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
          <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="mt-2 text-sm text-gray-500">
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
          </p>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-600"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
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