"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { AdminProduct } from "@/features/admin/product/servers";
import AdminProductImageSlider from "./admin-product-image-slider";
import { useToast } from "@/hooks";
import {
  FiArrowLeft,
  FiEdit3,
  FiCopy,
  FiBox,
  FiTag,
  FiFolder,
  FiCalendar,
  FiTruck,
  FiStar,
  FiBookOpen,
  FiCheckCircle,
  FiFileText,
  FiActivity,
  FiCpu,
} from "react-icons/fi";

interface AdminProductDetailPageProps {
  product: AdminProduct;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const getProductImage = (product: AdminProduct) => {
  if (product.image && product.image.trim().length > 0) {
    return product.image;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0] || "/logo.png";
  }

  return "/logo.png";
};

const getProductImages = (product: AdminProduct) => {
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image) => typeof image === "string" && image.trim().length > 0,
      )
    : [];

  if (images.length > 0) {
    return images;
  }

  const fallback = getProductImage(product);
  return fallback ? [fallback] : [];
};

const getStatusLabel = (product: AdminProduct) => {
  if (product.isActive === true) {
    return "Đang hoạt động";
  }

  if (product.isActive === false) {
    return "Tạm tắt";
  }

  return product.status || "Chưa rõ";
};

export default function AdminProductDetailPage({
  product,
}: AdminProductDetailPageProps) {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<"desc" | "spec" | "guide">("desc");
  const images = getProductImages(product);

  const handleCopyId = () => {
    if (!product.id) return;
    navigator.clipboard.writeText(product.id);
    showSuccess("Đã sao chép ID sản phẩm!");
  };

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const formatKeyLabel = (value: string) => {
    const withSpaces = value.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  const renderTextContent = (value?: unknown, icon?: React.ReactNode) => {
    if (value === undefined || value === null || value === "") {
      return (
        <div className="flex items-center gap-2 text-sm text-neutral-4 italic py-2">
          {icon} Chưa có thông tin
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <div className="flex items-center gap-2 text-sm text-neutral-4 italic py-2">
            {icon} Chưa có thông tin
          </div>
        );
      }

      return (
        <ul className="space-y-2.5 pl-2 text-neutral-2 text-sm md:text-base">
          {value.map((item, index) => (
            <li key={`${String(item)}-${index}`} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-1" />
              <span className="leading-relaxed">{String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (isRecord(value)) {
      const entries = Object.entries(value).filter(([, entryValue]) =>
        entryValue !== undefined && entryValue !== null && entryValue !== ""
      );

      if (entries.length === 0) {
        return (
          <div className="flex items-center gap-2 text-sm text-neutral-4 italic py-2">
            {icon} Chưa có thông tin
          </div>
        );
      }

      return (
        <div className="space-y-2.5 pl-1">
          {entries.map(([key, entryValue]) => (
            <div key={key} className="flex flex-wrap items-baseline gap-x-2 text-sm md:text-base">
              <span className="font-semibold text-neutral-3">
                {formatKeyLabel(key)}:
              </span>
              <span className="text-neutral-2">
                {String(entryValue)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-neutral-2 text-sm md:text-base leading-relaxed whitespace-pre-line pl-1">
        {String(value)}
      </div>
    );
  };

  const stockColor = (stock?: number) => {
    if (!stock || stock === 0) return "bg-red-500";
    if (stock < 10) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const stockBgColor = (stock?: number) => {
    if (!stock || stock === 0) return "bg-red-50";
    if (stock < 10) return "bg-amber-50";
    return "bg-emerald-50";
  };

  const stockTextColor = (stock?: number) => {
    if (!stock || stock === 0) return "text-red-600";
    if (stock < 10) return "text-amber-700";
    return "text-emerald-700";
  };

  const stockBorderColor = (stock?: number) => {
    if (!stock || stock === 0) return "border-red-200";
    if (stock < 10) return "border-amber-200";
    return "border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Hide the parent layout's breadcrumb */}
      <style>{`
        nav[aria-label="Breadcrumb"] {
          display: none !important;
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-20 pb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-4">
          <Link href="/admin/dashboard" className="hover:text-primary-1 transition-colors">Admin</Link>
          <span>/</span>
          <Link href="/admin/products" className="hover:text-primary-1 transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-neutral-2 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-20 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-2 shadow-sm transition hover:border-neutral-4 hover:bg-neutral-10/5 sm:text-sm"
          >
            <FiArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-1 bg-primary-1 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-primary-1/10 transition hover:bg-primary-2 hover:border-primary-2 sm:text-sm"
          >
            <FiEdit3 className="h-4 w-4" />
            Chỉnh sửa sản phẩm
          </Link>
        </div>
      </div>

      {/* Main product cards grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - Image & ID */}
        <div className="lg:col-span-5 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm flex flex-col items-center justify-center">
            <AdminProductImageSlider images={images} name={product.name} />
          </div>

          <div className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-4">Thông tin hệ thống</h4>
            <div className="flex items-center justify-between p-3.5 bg-neutral-10/40 rounded-xl border border-neutral-20">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-4">Product ID</p>
                <p className="text-sm font-mono font-semibold text-neutral-2 truncate max-w-[240px]">
                  {product.id}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-2 text-neutral-3 hover:text-primary-1 bg-white hover:bg-primary-6 border border-neutral-20 hover:border-primary-4 rounded-lg shadow-sm transition-all"
                title="Sao chép ID"
              >
                <FiCopy className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-neutral-10/30 rounded-xl border border-neutral-20 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-4">Tạo lúc</p>
                <p className="text-xs font-medium text-neutral-2">
                  {formatDateTime(product.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-neutral-10/30 rounded-xl border border-neutral-20 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-4">Cập nhật lúc</p>
                <p className="text-xs font-medium text-neutral-2">
                  {formatDateTime((product as any).updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-neutral-20 bg-white p-6 shadow-sm space-y-5">
            {/* Tags & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-6 px-3 py-1 text-xs font-semibold text-primary-1 border border-primary-4">
                  <FiFolder className="h-3.5 w-3.5" />
                  {product.category?.name || product.category?.id || "Chưa phân loại"}
                </span>
                {product.subCategory?.name && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-10 px-3 py-1 text-xs font-semibold text-neutral-2 border border-neutral-20">
                    {product.subCategory.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-10 px-3 py-1 text-xs font-semibold text-neutral-2 border border-neutral-20">
                  <FiTag className="h-3.5 w-3.5" />
                  {product.brand?.name || product.brand?.id || "Chưa có thương hiệu"}
                </span>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2.5 w-2.5`}>
                  {product.isActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${product.isActive ? "bg-emerald-500" : "bg-neutral-40"}`}></span>
                </span>
                <span className={`text-xs font-bold ${product.isActive ? "text-emerald-700" : "text-neutral-4"}`}>
                  {getStatusLabel(product).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h2 className="text-xl font-bold text-neutral-1 sm:text-2xl md:text-3xl leading-snug">
              {product.name || "Sản phẩm"}
            </h2>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-neutral-10/40 border border-neutral-20 flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-4">Giá bán hiện tại</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-black text-primary-1 md:text-3xl">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > (product.price || 0) ? (
                    <span className="text-sm text-neutral-4 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
              </div>
              
              {product.discount ? (
                <span className="inline-flex items-center justify-center rounded-xl bg-red-100 border border-red-200 px-3 py-1.5 text-sm font-bold text-red-700 shadow-sm animate-pulse">
                  GIẢM {product.discount}%
                </span>
              ) : null}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Stock Card */}
              <div className={`p-4 rounded-xl border ${stockBorderColor(product.stock)} ${stockBgColor(product.stock)} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-4 uppercase tracking-wider">Tồn kho</span>
                  <FiBox className={`h-4 w-4 ${stockTextColor(product.stock)}`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-extrabold ${stockTextColor(product.stock)}`}>
                      {product.stock || 0}
                    </span>
                    <span className="text-[11px] text-neutral-4">sản phẩm</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${stockColor(product.stock)}`} 
                      style={{ width: `${Math.min(100, (product.stock || 0) * 2)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status summary */}
              <div className="p-4 rounded-xl border border-neutral-20 bg-neutral-10/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-4 uppercase tracking-wider">Hiển thị</span>
                  <FiActivity className="h-4 w-4 text-neutral-3" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-extrabold text-neutral-2">
                    {product.isActive ? "On Store" : "Draft"}
                  </p>
                  <p className="text-[11px] text-neutral-4">
                    {product.isActive ? "Khách hàng có thể tìm mua" : "Đang tạm ẩn trên website"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="rounded-2xl border border-neutral-20 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-20 bg-neutral-10/20 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "desc"
                ? "border-primary-1 text-primary-1 bg-white"
                : "border-transparent text-neutral-3 hover:text-neutral-2 hover:bg-neutral-10/30"
            }`}
          >
            <FiFileText className="h-4 w-4" />
            Mô tả & Tổng quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "spec"
                ? "border-primary-1 text-primary-1 bg-white"
                : "border-transparent text-neutral-3 hover:text-neutral-2 hover:bg-neutral-10/30"
            }`}
          >
            <FiCpu className="h-4 w-4" />
            Thông số & Thành phần
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "guide"
                ? "border-primary-1 text-primary-1 bg-white"
                : "border-transparent text-neutral-3 hover:text-neutral-2 hover:bg-neutral-10/30"
            }`}
          >
            <FiBookOpen className="h-4 w-4" />
            Sử dụng & Lợi ích
          </button>
        </div>

        {/* Tab content display with animated padding */}
        <div className="p-6 transition-all duration-300">
          {activeTab === "desc" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-3">Mô tả ngắn</h4>
                <div className="p-4 rounded-xl bg-neutral-10/30 border border-neutral-20 italic">
                  {renderTextContent(product.description, <FiFileText className="h-4 w-4" />)}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-3">Mô tả chi tiết</h4>
                <div className="p-1 leading-relaxed">
                  {renderTextContent(product.longDescription, <FiFileText className="h-4 w-4" />)}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-neutral-20 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-2">
                    <FiTruck className="h-4.5 w-4.5 text-primary-1" />
                    <span>Vận chuyển</span>
                  </div>
                  {renderTextContent(product.shipping, <FiTruck className="h-4 w-4" />)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-2">
                    <FiStar className="h-4.5 w-4.5 text-primary-1" />
                    <span>Đánh giá</span>
                  </div>
                  {renderTextContent(product.review, <FiStar className="h-4 w-4" />)}
                </div>
              </div>
            </div>
          )}

          {activeTab === "spec" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-neutral-10/20 border border-neutral-20 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-20 text-sm font-bold text-neutral-2">
                  <FiCpu className="h-4.5 w-4.5 text-primary-1" />
                  <span>Thông số kỹ thuật</span>
                </div>
                {renderTextContent(product.specifications, <FiCpu className="h-4 w-4" />)}
              </div>
              <div className="p-5 rounded-2xl bg-neutral-10/20 border border-neutral-20 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-20 text-sm font-bold text-neutral-2">
                  <FiTag className="h-4.5 w-4.5 text-primary-1" />
                  <span>Thành phần</span>
                </div>
                {renderTextContent(product.ingredients, <FiTag className="h-4 w-4" />)}
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-neutral-10/20 border border-neutral-20 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-20 text-sm font-bold text-neutral-2">
                  <FiBookOpen className="h-4.5 w-4.5 text-primary-1" />
                  <span>Hướng dẫn sử dụng</span>
                </div>
                {renderTextContent(product.usage, <FiBookOpen className="h-4 w-4" />)}
              </div>
              <div className="p-5 rounded-2xl bg-neutral-10/20 border border-neutral-20 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-20 text-sm font-bold text-neutral-2">
                  <FiCheckCircle className="h-4.5 w-4.5 text-primary-1" />
                  <span>Lợi ích sản phẩm</span>
                </div>
                {renderTextContent(product.benefits, <FiCheckCircle className="h-4 w-4" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
