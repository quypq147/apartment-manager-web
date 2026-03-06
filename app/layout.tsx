// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header"; // Import Header ở đây

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeManager - Nền tảng quản lý nhà trọ thông minh",
  description: "Giải pháp toàn diện giúp chủ nhà tối ưu hóa vận hành, quản lý hợp đồng, hóa đơn và khách thuê.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        {/* Gắn thẻ main để chứa nội dung các trang */}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}