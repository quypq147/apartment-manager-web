import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Bạn chưa đăng nhập" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ChangePasswordBody;
    const currentPassword = body.currentPassword?.trim();
    const newPassword = body.newPassword?.trim();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu hiện tại không đúng" },
        { status: 400 },
      );
    }

    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu mới phải khác mật khẩu hiện tại" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Đổi mật khẩu thành công" },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/auth/change-password error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
