"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiGrid,
  FiMenu,
  FiShoppingBag,
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";

interface AdminShellProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: IconType;
}

interface BreadcrumbItem {
  href: string;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/admin/order", label: "Đơn hàng", icon: FiShoppingBag },
  { href: "/admin/user", label: "Người dùng", icon: FiUsers },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: FiTag },
  { href: "/admin/reports", label: "Thống kê", icon: FiTrendingUp },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const routeLabelMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  order: "Đơn hàng",
  user: "Người dùng",
  coupons: "Mã giảm giá",
  reports: "Thống kê",
};

const toTitleCase = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getSegmentLabel = (segment: string, previousSegment?: string) => {
  const directLabel = routeLabelMap[segment];
  if (directLabel) {
    return directLabel;
  }

  if (previousSegment === "order") {
    const shortId = segment.length > 6 ? segment.slice(-6).toUpperCase() : segment.toUpperCase();
    return `Chi tiết #${shortId}`;
  }

  if (previousSegment === "user") {
    return "Chi tiết người dùng";
  }

  return toTitleCase(segment);
};

const buildBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ href: "/admin/dashboard", label: "Dashboard" }];
  }

  return segments.map((rawSegment, index) => {
    const segment = decodeURIComponent(rawSegment);
    const previousSegment = index > 0 ? decodeURIComponent(segments[index - 1]) : undefined;

    return {
      href: `/${segments.slice(0, index + 1).join("/")}`,
      label: getSegmentLabel(segment, previousSegment),
    };
  });
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const desktopSidebarWidthClass = isSidebarCollapsed ? "lg:w-[5.5rem]" : "lg:w-80";
  const desktopContentPaddingClass = isSidebarCollapsed ? "lg:pl-[5.5rem]" : "lg:pl-80";

  const breadcrumbItems = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

  const pageTitle = useMemo(() => {
    const currentBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
    if (currentBreadcrumb) {
      return currentBreadcrumb.label;
    }

    const currentItem = navigationItems.find((item) =>
      isActivePath(pathname, item.href),
    );
    return currentItem?.label ?? "Admin";
  }, [breadcrumbItems, pathname]);

  return (
    <div className="min-h-screen bg-neutral-10 text-neutral-black">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-neutral-20 bg-white transition-[width,transform] duration-300 lg:translate-x-0 ${desktopSidebarWidthClass} ${
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

        <nav className="space-y-1 p-4">
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

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-neutral-black">{pageTitle}</h1>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-0.5 hidden items-center gap-1 text-xs text-neutral-4 sm:flex"
                >
                  {breadcrumbItems.map((item, index) => {
                    const isLastItem = index === breadcrumbItems.length - 1;

                    return (
                      <Fragment key={item.href}>
                        {index > 0 ? <FiChevronRight size={12} /> : null}
                        {isLastItem ? (
                          <span className="font-medium text-neutral-3">{item.label}</span>
                        ) : (
                          <Link
                            href={item.href}
                            className="transition hover:text-primary-1"
                          >
                            {item.label}
                          </Link>
                        )}
                      </Fragment>
                    );
                  })}
                </nav>
              </div>
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

        <main className="p-4 sm:p-6">{children}</main>
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
