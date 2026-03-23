// app/(auth)/register/page.tsx
"use client";

import { SignUpForm } from "@/components/sign-up-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Đăng Ký Tài Khoản</h1>
          <p className="text-sm text-gray-500 mt-2">Dành riêng cho Chủ trọ / Quản lý tòa nhà</p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
}