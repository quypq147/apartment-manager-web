// components/nav.tsx
import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="hidden md:flex items-center gap-8">
      <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
        Tính năng
      </Link>
      <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
        Bảng giá
      </Link>
      <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
        Liên hệ
      </Link>
    </nav>
  );
}