"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";



export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "LANDLORD",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      setLoading(false);
      return;
    }
    if(formData.email.trim() === "") {
      setError("Email không được để trống");
      setLoading(false);
      return;
    }

    if (emailExists) {
      setError("Email đã được đăng ký");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: formData.role,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      // Redirect to login
      router.push("/login?message=Đăng ký thành công. Vui lòng đăng nhập");
    } catch {
      setError("Lỗi kết nối");
      setLoading(false);
    }
  };

  const checkEmailExists = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setEmailExists(false);
      return;
    }

    try {
      setCheckingEmail(true);
      const response = await fetch(
        `/api/auth/register?email=${encodeURIComponent(normalizedEmail)}`
      );
      const result = await response.json();

      if (result.success) {
        const exists = Boolean(result.data?.exists);
        setEmailExists(exists);
        if (exists) {
          setError("Email đã được đăng ký");
        } else if (error === "Email đã được đăng ký") {
          setError(null);
        }
      }
    } catch {
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
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
          Vai trò
        </label>
        <select
          value={formData.role}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, role: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
          disabled={loading}
        >
          <option value="LANDLORD">Chủ trọ</option>
          <option value="TENANT">Khách thuê</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, name: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          placeholder="Nguyễn Văn A"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(event) => {
            setFormData((prev) => ({ ...prev, email: event.target.value }));
            setEmailExists(false);
            if (error === "Email đã được đăng ký") {
              setError(null);
            }
          }}
          onBlur={(event) => void checkEmailExists(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          placeholder="chutro@example.com"
          required
          disabled={loading}
        />
        {checkingEmail && (
          <p className="mt-1 text-xs text-gray-500">Đang kiểm tra email...</p>
        )}
        {!checkingEmail && emailExists && (
          <p className="mt-1 text-xs text-red-600">Email đã được đăng ký</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại (tùy chọn)
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, phone: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          placeholder="0901234567"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Xác nhận mật khẩu
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || checkingEmail || emailExists}
        className="w-full py-3 px-4 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản quản lý"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}