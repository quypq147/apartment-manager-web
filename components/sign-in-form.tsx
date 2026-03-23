"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // Redirect based on role
      const userData = result.data;
      if (userData.role === "LANDLORD") {
        router.push("/dashboard/owner");
      } else if (userData.role === "TENANT") {
        router.push("/dashboard/tenant");
      } else if (userData.role === "ADMIN") {
        router.push("/dashboard/admin");
      }
    } catch {
      setError("Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          placeholder="••••••••"
          required
          disabled={loading}
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
      </button>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md mb-3">
          Khách thuê phòng vui lòng sử dụng tài khoản do Chủ trọ cấp để đăng nhập.
        </p>
        <p className="text-sm text-gray-600 text-center">
          Bạn là chủ trọ mới?{" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </form>
  );
}