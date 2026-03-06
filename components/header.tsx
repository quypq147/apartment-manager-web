// components/header.tsx
import Link from 'next/link';
import Nav from './nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            HomeManager
          </span>
        </Link>

        {/* Navigation */}
        <Nav />

        {/* Call to Action (Auth) */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden text-sm font-medium text-gray-700 hover:text-blue-600 md:block"
          >
            Đăng nhập
          </Link>
          <Link 
            href="/register" 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}