"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  exact?: boolean;
}

export function NavLink({
  href,
  children,
  icon,
  className = "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors",
  activeClassName = "text-blue-700 bg-blue-50",
  inactiveClassName = "text-muted-foreground hover:bg-accent hover:text-foreground",
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : inactiveClassName}`}
    >
      {icon}
      {children}
    </Link>
  );
}
