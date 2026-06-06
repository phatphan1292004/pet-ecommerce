"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/hooks";
import type { IconType } from "react-icons";
import { AiFillProduct } from "react-icons/ai";
import {
  FiBell,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronDown,
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
  children?: Array<{ href: string; label: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/admin/products", label: "Sản phẩm", icon: AiFillProduct },
  { href: "/admin/order", label: "Đơn hàng", icon: FiShoppingBag },
  { href: "/admin/user", label: "Người dùng", icon: FiUsers },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: FiTag },
  {
    href: "/admin/reports",
    label: "Thống kê",
    icon: FiTrendingUp,
    children: [
      { href: "/admin/reports/revenue", label: "Doanh thu" },
      { href: "/admin/reports/orders", label: "Đơn hàng" },
      { href: "/admin/reports/products", label: "Sản phẩm" },
      { href: "/admin/reports/customers", label: "Khách hàng" },
    ],
  },
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { showSuccess } = useToast();

  const [notifications, setNotifications] = useState<Array<{
    orderId: string;
    customerName: string;
    createdAt: Date;
    isRead: boolean;
  }>>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  // Load notifications from local storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("admin:notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      } catch (err) {
        console.error("Failed to parse notifications:", err);
      }
    }
  }, []);

  // Save notifications to local storage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin:notifications", JSON.stringify(notifications));
  }, [notifications]);


  // Socket setup
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_PET_ECOMMERCE_API || "http://localhost:3000";
    const socket = io(API_BASE, {
      transports: ["websocket"],
    });

    socket.on("new_order", (data: any) => {
      console.log("[AdminShell] Received new_order:", data);


      // Add to notification list
      setNotifications((prev) => [
        {
          orderId: data.orderId,
          customerName: data.arrivalName || "Khách hàng",
          createdAt: new Date(data.createdAt || Date.now()),
          isRead: false,
        },
        ...prev,
      ]);

      // Show a toast message
      const nameLabel = data.arrivalName ? ` từ ${data.arrivalName}` : "";
      showSuccess(`🔔 Có đơn hàng mới vừa được đặt${nameLabel}!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [showSuccess]);

  const handleNotificationClick = (item: any) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.orderId === item.orderId ? { ...n, isRead: true } : n))
    );
    setIsNotificationDropdownOpen(false);
    // Navigate to order details
    router.push(`/admin/order/${item.orderId}`);
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-neutral-20 bg-white transition-[width,transform] duration-300 lg:translate-x-0 ${desktopSidebarWidthClass} ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div
          className={`flex h-16 items-center justify-between border-b border-neutral-20 ${isSidebarCollapsed ? "px-2" : "px-4 lg:px-5"
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
              className={`h-auto transition-all ${isSidebarCollapsed ? "w-9 lg:w-9" : "w-24 lg:w-24"
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
            const hasChildren = Boolean(item.children?.length);
            const isExpanded = expandedItems[item.href] ?? false;
            const showChildren = hasChildren && isExpanded && !isSidebarCollapsed;

            return (
              <div key={item.href} className="space-y-1">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [item.href]: !(prev[item.href] ?? false),
                      }))
                    }
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`flex w-full items-center rounded-xl py-4 text-[16px] font-medium transition ${active
                      ? "bg-primary-1 text-white"
                      : "text-neutral-2 hover:bg-neutral-10"
                      } ${isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"}`}
                  >
                    <Icon size={18} />
                    <span className={isSidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                    {!isSidebarCollapsed ? (
                      <FiChevronDown
                        size={16}
                        className={`ml-auto transition ${isExpanded ? "rotate-180" : ""}`}
                      />
                    ) : null}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl py-4 text-[16px] font-medium transition ${active
                      ? "bg-primary-1 text-white"
                      : "text-neutral-2 hover:bg-neutral-10"
                      } ${isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"}`}
                  >
                    <Icon size={18} />
                    <span className={isSidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </Link>
                )}

                {showChildren ? (
                  <div className="ml-10 space-y-1">
                    {item.children?.map((child) => {
                      const childActive = isActivePath(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center rounded-lg px-3 py-2 text-[14px] transition ${childActive
                            ? "bg-primary-6 text-primary-1"
                            : "text-neutral-4 hover:bg-neutral-10"
                            }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-neutral-20 p-4">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            title={isSidebarCollapsed ? "Trang chủ website" : undefined}
            className={`flex items-center rounded-xl py-3 text-[15px] font-medium text-neutral-2 transition hover:bg-neutral-10 ${isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"
              }`}
          >
            <FiHome size={18} />
            <span className={isSidebarCollapsed ? "lg:hidden" : ""}>Về trang chủ</span>
          </Link>

          <button
            type="button"
            className={`flex items-center rounded-xl py-3 text-[15px] font-medium text-neutral-2 transition hover:bg-neutral-10 disabled:cursor-not-allowed disabled:opacity-60 ${isSidebarCollapsed ? "justify-center px-2 lg:px-2" : "gap-3 px-4"
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationDropdownOpen((prev) => !prev)}
                  className="relative rounded-full border border-neutral-20 p-2 text-neutral-3 transition hover:bg-neutral-10"
                  aria-label="Thông báo"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-20 bg-white shadow-lg z-50 overflow-hidden">
                      <div className="border-b border-neutral-20 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-2">Thông báo đơn hàng</h3>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                            }
                            className="text-xs text-primary-1 hover:underline"
                          >
                            Đọc tất cả
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-neutral-4">
                            Không có thông báo mới
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <button
                              key={item.orderId}
                              type="button"
                              onClick={() => handleNotificationClick(item)}
                              className={`w-full text-left px-4 py-3 border-b border-neutral-10 hover:bg-neutral-10 transition-colors flex flex-col gap-1 ${!item.isRead ? "bg-primary-6/10" : ""
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary-1">Đơn hàng mới!</span>
                                <span className="text-[10px] text-neutral-4">
                                  {formatNotificationTime(item.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-2">
                                Khách hàng <strong>{item.customerName}</strong> vừa đặt đơn hàng mới.
                              </p>
                              <span className="text-[10px] text-neutral-4 font-mono">
                                ID: {item.orderId}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
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
