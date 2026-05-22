"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import { AiFillProduct } from "react-icons/ai";
import {
  FiBell,
  FiChevronsLeft,
  FiChevronsRight,
  FiGrid,
  FiMenu,
  FiShoppingBag,
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiHome,
  FiLogOut,
  FiMessageCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { logout } from "@/integrations/firebase";
import { CiDiscount1 } from "react-icons/ci";

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
  { href: "/admin/products", label: "Sản phẩm", icon: AiFillProduct },
  { href: "/admin/order", label: "Đơn hàng", icon: FiShoppingBag },
  { href: "/admin/user", label: "Người dùng", icon: FiUsers },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: FiTag },
  { href: "/admin/reports", label: "Thống kê", icon: FiTrendingUp },
  { href: "/admin/discount-program", label: "Chương trình giảm giá", icon: CiDiscount1 },
  { href: "/admin/chat", label: "Chat", icon: FiMessageCircle },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsSidebarOpen(false);
      await logout();
      router.push("/");
    } catch {
      // ignore - optional: show toast
    } finally {
      setIsLoggingOut(false);
    }
  };

  const desktopSidebarWidthClass = isSidebarCollapsed ? "lg:w-[5.5rem]" : "lg:w-80";
  const desktopContentPaddingClass = isSidebarCollapsed ? "lg:pl-[5.5rem]" : "lg:pl-80";

  return (
    <div className="min-h-screen bg-neutral-10 text-neutral-black">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-neutral-20 bg-white transition-[width,transform] duration-300 lg:translate-x-0 ${desktopSidebarWidthClass} ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className={`flex h-16 items-center justify-between border-b border-neutral-20 ${
            isSidebarCollapsed ? "px-2" : "px-4 lg:px-5"
          }`}
        >
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center"
            onClick={() => setIsSidebarOpen(false)}
            title="Trang chủ admin"
          >
            <Image
              src="/logo.png"
              alt="ODeli Admin"
              width={100}
              height={50}
              className={`h-auto transition-all ${
                isSidebarCollapsed ? "w-9 lg:w-9" : "w-24 lg:w-24"
              }`}
            />
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-2 text-neutral-3 transition hover:bg-neutral-10 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng menu"
            >
              <FiX size={20} />
            </button>

            <button
              type="button"
              className="hidden rounded-md p-2 text-neutral-3 transition hover:bg-neutral-10 lg:inline-flex"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {isSidebarCollapsed ? (
                <FiChevronsRight size={18} />
              ) : (
                <FiChevronsLeft size={18} />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-4 text-[16px] font-medium transition ${
                  active
                    ? "bg-primary-1 text-white"
                    : "text-neutral-2 hover:bg-neutral-10"
                } ${isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"}`}
              >
                <Icon size={18} />
                <span className={isSidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-neutral-20 p-4">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            title={isSidebarCollapsed ? "Trang chủ website" : undefined}
            className={`flex items-center rounded-xl py-3 text-[15px] font-medium text-neutral-2 transition hover:bg-neutral-10 ${
              isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"
            }`}
          >
            <FiHome size={18} />
            <span className={isSidebarCollapsed ? "lg:hidden" : ""}>Trang chủ</span>
          </Link>

          <button
            type="button"
            className={`flex items-center rounded-xl py-3 text-[15px] font-medium text-neutral-2 transition hover:bg-neutral-10 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"
            }`}
            aria-label="Đăng xuất"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={isSidebarCollapsed ? "Đăng xuất" : undefined}
          >
            <FiLogOut size={18} />
            <span className={isSidebarCollapsed ? "lg:hidden" : ""}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className={`transition-[padding] duration-300 ${desktopContentPaddingClass}`}>
        <header className="sticky top-0 z-30 border-b border-neutral-20 bg-white/95 px-4 py-2 backdrop-blur sm:px-6">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-neutral-20 p-2 text-neutral-3 transition hover:bg-neutral-10 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Mở menu"
              >
                <FiMenu size={20} />
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-neutral-20 p-2 text-neutral-3 transition hover:bg-neutral-10"
                aria-label="Thông báo"
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
          </div>
        </header>

        <main className="p-4 sm:p-6 overflow-x-auto">{children}</main>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-neutral-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Đóng menu"
        />
      ) : null}
    </div>
  );
}
