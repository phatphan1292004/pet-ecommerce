"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiGrid,
  FiMenu,
  FiShoppingBag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Image from "next/image";

interface AdminShellProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: IconType;
}

const navigationItems: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/admin/order", label: "Đơn hàng", icon: FiShoppingBag },
  { href: "/admin/user", label: "Người dùng", icon: FiUsers },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const currentItem = navigationItems.find((item) =>
      isActivePath(pathname, item.href),
    );
    return currentItem?.label ?? "Admin";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-10 text-neutral-black">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-neutral-20 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-20 px-6">
          <Link
            href="/admin/dashboard"
            className="text-xl font-semibold tracking-wide text-primary-1 mx-auto"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Image src="/logo.png" alt="ODeli Admin" width={100} height={50} />
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-neutral-3 transition hover:bg-neutral-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Dong menu"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-4 text-[16px] font-medium transition ${
                  active
                    ? "bg-primary-1 text-white"
                    : "text-neutral-2 hover:bg-neutral-10"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-20 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-neutral-20 p-2 text-neutral-3 transition hover:bg-neutral-10 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Mo menu"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-neutral-black">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-neutral-20 p-2 text-neutral-3 transition hover:bg-neutral-10"
              aria-label="Thong bao"
            >
              <FiBell size={18} />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-neutral-20 px-2 py-1 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-5 text-xs font-semibold text-primary-1">
                AD
              </div>
              <span className="pr-2 text-sm font-medium text-neutral-2">Admin</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-neutral-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Dong menu"
        />
      ) : null}
    </div>
  );
}