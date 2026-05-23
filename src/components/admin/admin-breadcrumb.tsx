"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";

interface BreadcrumbItem {
  href: string;
  label: string;
}

const routeLabelMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  order: "Đơn hàng",
  user: "Người dùng",
  coupons: "Mã giảm giá",
  reports: "Thống kê",
  revenue: "Doanh thu",
  orders: "Đơn hàng",
  products: "Sản phẩm",
  customers: "Khách hàng",
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

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbItems = buildBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 px-1 text-sm text-neutral-4">
      {breadcrumbItems.map((item, index) => {
        const isLastItem = index === breadcrumbItems.length - 1;

        return (
          <div key={item.href} className="inline-flex items-center gap-1">
            {index > 0 ? <FiChevronRight size={12} /> : null}
            {isLastItem ? (
              <span className="font-medium text-neutral-3">{item.label}</span>
            ) : (
              <Link href={item.href} className="transition hover:text-primary-1">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}