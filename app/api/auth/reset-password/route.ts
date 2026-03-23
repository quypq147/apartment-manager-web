import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token?.trim() || !newPassword?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Token và mật khẩu mới là bắt buộc' },
        { status: 400 },
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token.trim(),
        resetPasswordExpires: { gt: new Date() }, // Check if token is not expired
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword.trim());

    // Update user and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Cập nhật mật khẩu thành công' },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}