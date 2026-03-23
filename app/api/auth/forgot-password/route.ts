import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer"; // Or use Resend, SendGrid, etc.

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Email không hợp lệ" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      // Return 200 even if user isn't found to prevent email enumeration attacks
      return NextResponse.json(
        { success: true, message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi." },
        { status: 200 },
      );
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { resetPasswordToken: resetToken, resetPasswordExpires },
    });

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Forgot password error: Missing SMTP configuration");
      return NextResponse.json(
        { success: false, error: "Hệ thống email chưa được cấu hình" },
        { status: 500 },
      );
    }

    // Send Email (Configure with your SMTP settings)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Apartment Manager" <noreply@yourdomain.com>',
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p>Nhấn vào liên kết sau để đổi mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p><p>Liên kết sẽ hết hạn sau 1 giờ.</p>`,
    });

    return NextResponse.json(
      { success: true, message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
