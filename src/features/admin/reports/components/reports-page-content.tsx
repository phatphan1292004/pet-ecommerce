"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiBarChart2,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import type { AdminStatisticsData, AdminStatisticsProductItem } from "../servers/statistics";

type ReportsView = "revenue" | "orders" | "products" | "customers" | "overview";

interface ReportsPageContentProps {
  data: AdminStatisticsData;
  errorMessage?: string;
  view?: ReportsView;
}

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

const formatNumber = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return Math.round(value).toLocaleString("vi-VN");
};

const formatPercent = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
};

const formatDateLabel = (value: string) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const getProductImage = (item: AdminStatisticsProductItem) =>
  item.image && item.image.trim().length > 0 ? item.image : "/logo.png";

const chartOptions = [
  { key: "last7Days", label: "7 ngày" },
  { key: "last30Days", label: "30 ngày" },
  { key: "last6Months", label: "6 tháng" },
  { key: "last12Months", label: "12 tháng" },
] as const;

type ChartKey = (typeof chartOptions)[number]["key"];

function ProductListCard({
  title,
  items,
  renderMeta,
  emptyLabel,
}: {
  title: string;
  items: AdminStatisticsProductItem[];
  renderMeta: (item: AdminStatisticsProductItem) => string;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-1">{title}</p>
        <span className="text-xs text-neutral-4">{items.length} mục</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-20 bg-neutral-10 px-3 py-4 text-center text-xs text-neutral-4">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/products/${item.id}/edit`}
              className="flex items-center gap-3 rounded-xl border border-neutral-20 bg-neutral-10 px-3 py-2 text-sm transition hover:border-primary-4"
            >
              <img
                src={getProductImage(item)}
                alt={item.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-medium text-neutral-1">
                  {item.name || "Sản phẩm"}
                </p>
                <p className="mt-1 text-[11px] text-neutral-4">{renderMeta(item)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const viewConfig: Record<ReportsView, { title: string; description: string }> = {
  revenue: {
    title: "Báo cáo doanh thu",
    description: "Tổng quan doanh thu và đơn hàng theo thời gian",
  },
  orders: {
    title: "Thống kê đơn hàng",
    description: "Tình hình xử lý và tỷ lệ hủy đơn hàng",
  },
  products: {
    title: "Thống kê sản phẩm",
    description: "Top bán chạy, doanh thu và tồn kho",
  },
  customers: {
    title: "Thống kê khách hàng",
    description: "Khách mới, khách quay lại và top chi tiêu",
  },
  overview: {
    title: "Tổng quan báo cáo",
    description: "Tổng hợp doanh thu, sản phẩm, đơn hàng và khách hàng",
  },
};

export default function ReportsPageContent({
  data,
  errorMessage = "",
  view = "revenue",
}: ReportsPageContentProps) {
  const [selectedSeries, setSelectedSeries] = useState<ChartKey>("last7Days");
  const resolvedView = view;
  const showRevenue = resolvedView === "revenue" || resolvedView === "overview";
  const showOrders = resolvedView === "orders" || resolvedView === "overview";
  const showProducts = resolvedView === "products" || resolvedView === "overview";
  const showCustomers = resolvedView === "customers" || resolvedView === "overview";
  const header = viewConfig[resolvedView];

  const revenueSeries = data.revenue.series[selectedSeries] || [];
  const chartData = useMemo(
    () =>
      revenueSeries.map((item) => ({
        label: formatDateLabel(item.date),
        revenue: item.revenue,
        orders: item.orders,
      })),
    [revenueSeries]
  );

  const customerChartData = useMemo(
    () =>
      data.customers.newCustomersSeriesLast30Days.map((item) => ({
        label: formatDateLabel(item.date),
        customers: item.revenue,
      })),
    [data.customers.newCustomersSeriesLast30Days]
  );

  return (
    <section className="space-y-6">
      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-black sm:text-lg">
              {header.title}
            </h2>
            <p className="text-xs text-neutral-4 sm:text-sm">{header.description}</p>
          </div>
        </div>

        {showRevenue ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
                <p className="text-xs text-neutral-4">Doanh thu hôm nay</p>
                <p className="mt-2 text-lg font-semibold text-neutral-1">
                  {formatCurrency(data.revenue.today)}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
                <p className="text-xs text-neutral-4">Doanh thu tháng này</p>
                <p className="mt-2 text-lg font-semibold text-neutral-1">
                  {formatCurrency(data.revenue.month)}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
                <p className="text-xs text-neutral-4">Doanh thu năm nay</p>
                <p className="mt-2 text-lg font-semibold text-neutral-1">
                  {formatCurrency(data.revenue.year)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-20 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-1">Doanh thu & đơn hàng</p>
                  <p className="text-xs text-neutral-4">Thống kê theo mốc thời gian</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {chartOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedSeries(option.key)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        selectedSeries === option.key
                          ? "bg-primary-1 text-white"
                          : "border border-neutral-20 bg-white text-neutral-4 hover:border-primary-4"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatCurrency(value) : formatNumber(value),
                        name === "revenue" ? "Doanh thu" : "Đơn hàng",
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="#fdba74" />
                    <Area type="monotone" dataKey="orders" stroke="#0ea5e9" fill="#bae6fd" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : null}

        {showOrders ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4 xl:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-4">Tổng đơn hàng</p>
                <FiShoppingCart size={16} className="text-neutral-4" />
              </div>
              <p className="mt-2 text-lg font-semibold text-neutral-1">
                {formatNumber(data.orders.total)}
              </p>
              <p className="mt-2 text-xs text-neutral-4">
                Tỷ lệ hủy: {formatPercent(data.orders.cancellationRate)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
              <p className="text-xs text-neutral-4">Đang xử lý</p>
              <p className="mt-1 text-lg font-semibold text-neutral-1">
                {formatNumber(data.orders.pending)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
              <p className="text-xs text-neutral-4">Đang giao</p>
              <p className="mt-1 text-lg font-semibold text-neutral-1">
                {formatNumber(data.orders.delivering)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
              <p className="text-xs text-neutral-4">Đã giao</p>
              <p className="mt-1 text-lg font-semibold text-neutral-1">
                {formatNumber(data.orders.delivered)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
              <p className="text-xs text-neutral-4">Đã hủy</p>
              <p className="mt-1 text-lg font-semibold text-neutral-1">
                {formatNumber(data.orders.cancelled)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {showCustomers ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
          <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-1">Khách hàng mới 30 ngày</p>
                <p className="text-xs text-neutral-4">Biểu đồ khách hàng mới theo ngày</p>
              </div>
              <FiBarChart2 size={16} className="text-neutral-4" />
            </div>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={customerChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), "Khách mới"]} />
                  <Area type="monotone" dataKey="customers" stroke="#22c55e" fill="#bbf7d0" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-1">Tổng quan khách hàng</p>
              <FiUsers size={16} className="text-neutral-4" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                <p className="text-xs text-neutral-4">Tổng khách</p>
                <p className="mt-1 text-base font-semibold text-neutral-1">
                  {formatNumber(data.customers.total)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                <p className="text-xs text-neutral-4">Khách mới hôm nay</p>
                <p className="mt-1 text-base font-semibold text-neutral-1">
                  {formatNumber(data.customers.newToday)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                <p className="text-xs text-neutral-4">Khách mới tháng</p>
                <p className="mt-1 text-base font-semibold text-neutral-1">
                  {formatNumber(data.customers.newThisMonth)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3">
                <p className="text-xs text-neutral-4">Khách mới năm</p>
                <p className="mt-1 text-base font-semibold text-neutral-1">
                  {formatNumber(data.customers.newThisYear)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-neutral-10 p-3 sm:col-span-2">
                <p className="text-xs text-neutral-4">Khách quay lại</p>
                <p className="mt-1 text-base font-semibold text-neutral-1">
                  {formatNumber(data.customers.returning)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showProducts ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ProductListCard
            title="Top bán chạy"
            items={data.products.topSelling}
            emptyLabel="Chưa có sản phẩm bán chạy"
            renderMeta={(item) =>
              `Số lượng: ${formatNumber(item.quantity)} · Doanh thu: ${formatCurrency(item.revenue)}`
            }
          />
          <ProductListCard
            title="Top doanh thu"
            items={data.products.topRevenue}
            emptyLabel="Chưa có sản phẩm doanh thu cao"
            renderMeta={(item) =>
              `Doanh thu: ${formatCurrency(item.revenue)} · Số lượng: ${formatNumber(item.quantity)}`
            }
          />
          <ProductListCard
            title="Tồn kho thấp"
            items={data.products.lowStock}
            emptyLabel="Không có sản phẩm tồn kho thấp"
            renderMeta={(item) => `Tồn kho: ${formatNumber(item.stock)}`}
          />
          <ProductListCard
            title="Tồn kho cao"
            items={data.products.highStock}
            emptyLabel="Không có sản phẩm tồn kho cao"
            renderMeta={(item) => `Tồn kho: ${formatNumber(item.stock)}`}
          />
          <ProductListCard
            title="Bán chậm (30 ngày)"
            items={data.products.lowSelling}
            emptyLabel="Không có sản phẩm bán chậm"
            renderMeta={(item) =>
              `Số lượng: ${formatNumber(item.quantity)} · Doanh thu: ${formatCurrency(item.revenue)}`
            }
          />
        </div>
      ) : null}

      {showCustomers ? (
        <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-1">Top chi tiêu</p>
            <FiTrendingUp size={16} className="text-neutral-4" />
          </div>
          <div className="mt-3 space-y-2">
            {data.customers.topSpenders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-20 bg-neutral-10 px-3 py-4 text-center text-xs text-neutral-4">
                Chưa có dữ liệu chi tiêu
              </div>
            ) : (
              data.customers.topSpenders.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-xl border border-neutral-20 bg-neutral-10 px-3 py-2"
                >
                  <p className="text-xs font-medium text-neutral-1">{customer.name}</p>
                  <p className="mt-1 text-[11px] text-neutral-4">
                    Tổng chi tiêu: {formatCurrency(customer.totalSpent)} · Đơn hàng: {formatNumber(customer.orders)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
