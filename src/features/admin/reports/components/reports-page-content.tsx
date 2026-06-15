"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiBarChart2,
  FiDownload,
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
  const [selectedOrderSeries, setSelectedOrderSeries] = useState<ChartKey>("last7Days");
  const [productChartTab, setProductChartTab] = useState<"selling" | "revenue">("selling");
  
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

  const orderSeries = data.revenue.series[selectedOrderSeries] || [];
  const orderChartData = useMemo(
    () =>
      orderSeries.map((item) => ({
        label: formatDateLabel(item.date),
        orders: item.orders,
      })),
    [orderSeries]
  );

  const customerChartData = useMemo(
    () =>
      data.customers.newCustomersSeriesLast30Days.map((item) => ({
        label: formatDateLabel(item.date),
        customers: item.revenue,
      })),
    [data.customers.newCustomersSeriesLast30Days]
  );

  const orderStatusData = useMemo(() => {
    return [
      { name: "Đang xử lý", value: data.orders.pending, color: "#f2bc57" }, // yellow
      { name: "Đang giao", value: data.orders.delivering, color: "#0ea5e9" }, // sky
      { name: "Đã giao", value: data.orders.delivered, color: "#10b981" }, // green/emerald
      { name: "Đã hủy", value: data.orders.cancelled, color: "#ef4444" }, // red
    ].filter((item) => item.value > 0);
  }, [data.orders]);

  const topSellingChartData = useMemo(() => {
    return [...data.products.topSelling]
      .slice(0, 5)
      .map((item) => ({
        name: item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name,
        fullName: item.name,
        value: item.quantity || 0,
      }))
      .reverse();
  }, [data.products.topSelling]);

  const topRevenueChartData = useMemo(() => {
    return [...data.products.topRevenue]
      .slice(0, 5)
      .map((item) => ({
        name: item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name,
        fullName: item.name,
        value: item.revenue || 0,
      }))
      .reverse();
  }, [data.products.topRevenue]);

  const customerDistributionData = useMemo(() => {
    const returning = data.customers.returning;
    const total = data.customers.total;
    const newOrOther = Math.max(0, total - returning);
    return [
      { name: "Khách quay lại", value: returning, color: "#d3242c" },
      { name: "Khách mới/khác", value: newOrOther, color: "#dadee3" },
    ].filter((item) => item.value > 0);
  }, [data.customers]);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRevenueExcel = () => {
    const headers = ["Ngày", "Doanh thu (VND)", "Số đơn hàng"];
    const rows = chartData.map((item) => [
      item.label,
      item.revenue.toString(),
      item.orders.toString()
    ]);
    downloadCSV(`Thong_ke_doanh_thu_${selectedSeries}.csv`, headers, rows);
  };

  const exportOrdersExcel = () => {
    const headers = ["Chỉ số", "Giá trị"];
    const rows = [
      ["Tổng đơn hàng", data.orders.total.toString()],
      ["Tỷ lệ hủy đơn (%)", data.orders.cancellationRate.toString()],
      ["Đơn đang xử lý", data.orders.pending.toString()],
      ["Đơn đang giao", data.orders.delivering.toString()],
      ["Đơn đã giao", data.orders.delivered.toString()],
      ["Đơn đã hủy", data.orders.cancelled.toString()],
    ];
    downloadCSV("Thong_ke_don_hang.csv", headers, rows);
  };

  const exportProductsExcel = () => {
    const headers = ["Loại danh mục", "Mã sản phẩm", "Tên sản phẩm", "Số lượng bán", "Doanh thu (VND)", "Tồn kho"];
    const rows: string[][] = [];
    
    data.products.topSelling.forEach((item) => {
      rows.push(["Top bán chạy", item.id, item.name, (item.quantity ?? 0).toString(), (item.revenue ?? 0).toString(), (item.stock ?? 0).toString()]);
    });
    data.products.topRevenue.forEach((item) => {
      rows.push(["Top doanh thu", item.id, item.name, (item.quantity ?? 0).toString(), (item.revenue ?? 0).toString(), (item.stock ?? 0).toString()]);
    });
    data.products.lowStock.forEach((item) => {
      rows.push(["Tồn kho thấp", item.id, item.name, "", "", (item.stock ?? 0).toString()]);
    });
    data.products.highStock.forEach((item) => {
      rows.push(["Tồn kho cao", item.id, item.name, "", "", (item.stock ?? 0).toString()]);
    });
    data.products.lowSelling.forEach((item) => {
      rows.push(["Bán chậm (30 ngày)", item.id, item.name, (item.quantity ?? 0).toString(), (item.revenue ?? 0).toString(), (item.stock ?? 0).toString()]);
    });

    downloadCSV("Thong_ke_san_pham.csv", headers, rows);
  };

  const exportCustomersExcel = () => {
    const headers = ["Chỉ số / Tên khách hàng", "Giá trị / Chi tiêu (VND)", "Đơn hàng"];
    const rows = [
      ["Tổng khách hàng", data.customers.total.toString(), ""],
      ["Khách mới hôm nay", data.customers.newToday.toString(), ""],
      ["Khách mới tháng này", data.customers.newThisMonth.toString(), ""],
      ["Khách mới năm nay", data.customers.newThisYear.toString(), ""],
      ["Khách quay lại", data.customers.returning.toString(), ""],
      ["--- Top chi tiêu ---", "", ""],
      ...data.customers.topSpenders.map((item) => [
        item.name,
        item.totalSpent.toString(),
        item.orders.toString()
      ])
    ];
    downloadCSV("Thong_ke_khach_hang.csv", headers, rows);
  };

  const exportOverviewExcel = () => {
    const headers = ["Phần", "Chỉ số", "Giá trị"];
    const rows = [
      ["Doanh thu", "Doanh thu hôm nay (VND)", data.revenue.today.toString()],
      ["Doanh thu", "Doanh thu tháng này (VND)", data.revenue.month.toString()],
      ["Doanh thu", "Doanh thu năm nay (VND)", data.revenue.year.toString()],
      ["Đơn hàng", "Tổng đơn hàng", data.orders.total.toString()],
      ["Đơn hàng", "Tỷ lệ hủy (%)", data.orders.cancellationRate.toString()],
      ["Khách hàng", "Tổng số khách hàng", data.customers.total.toString()],
      ["Khách hàng", "Khách quay lại", data.customers.returning.toString()],
    ];
    downloadCSV("Tong_quan_bao_cao.csv", headers, rows);
  };

  const handleExportExcel = () => {
    switch (resolvedView) {
      case "revenue":
        exportRevenueExcel();
        break;
      case "orders":
        exportOrdersExcel();
        break;
      case "products":
        exportProductsExcel();
        break;
      case "customers":
        exportCustomersExcel();
        break;
      case "overview":
        exportOverviewExcel();
        break;
      default:
        break;
    }
  };

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
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-1 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary-1 transition hover:bg-primary-6"
          >
            <FiDownload size={13} />
            Xuất Excel
          </button>
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
                      formatter={(value, name) => {
                        const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                        const seriesName = String(name);

                        return [
                          seriesName === "revenue"
                            ? formatCurrency(numericValue)
                            : formatNumber(numericValue),
                          seriesName === "revenue" ? "Doanh thu" : "Đơn hàng",
                        ];
                      }}
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
          <>
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

            {resolvedView === "orders" ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-1">Xu hướng đơn hàng</p>
                      <p className="text-xs text-neutral-4">Số lượng đơn hàng đặt theo thời gian</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {chartOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setSelectedOrderSeries(option.key)}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                            selectedOrderSeries === option.key
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
                      <BarChart data={orderChartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => [formatNumber(Number(value)), "Đơn hàng"]}
                        />
                        <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-1">Trạng thái đơn hàng</p>
                    <p className="text-xs text-neutral-4">Tỷ lệ phân bổ trạng thái đơn</p>
                  </div>
                  <div className="relative mt-4 flex-1 flex items-center justify-center min-h-[180px]">
                    {orderStatusData.length === 0 ? (
                      <div className="text-xs text-neutral-4">Chưa có dữ liệu đơn hàng</div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={orderStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {orderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatNumber(Number(value)), "Đơn hàng"]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-[10px] text-neutral-4">Tổng cộng</span>
                          <span className="text-base font-bold text-neutral-1">{formatNumber(data.orders.total)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]">
                    {orderStatusData.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-neutral-4">{item.name}:</span>
                        <span className="font-semibold text-neutral-1">{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </>
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
                  <Tooltip
                    formatter={(value) => {
                      const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                      return [formatNumber(numericValue), "Khách mới"];
                    }}
                  />
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
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <div className="md:col-span-3 grid gap-3 sm:grid-cols-2">
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
              {resolvedView === "customers" ? (
                <div className="md:col-span-2 flex flex-col items-center justify-between border-t border-neutral-20 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-4">
                  <p className="text-xs font-semibold text-neutral-2 mb-2">Cơ cấu khách hàng</p>
                  <div className="relative flex-1 flex items-center justify-center min-h-[140px] w-full">
                    {customerDistributionData.length === 0 ? (
                      <span className="text-[11px] text-neutral-4">Không có dữ liệu</span>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={customerDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={55}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {customerDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatNumber(Number(value)), "Khách"]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-[10px] text-neutral-4">Quay lại</span>
                          <span className="text-xs font-bold text-neutral-1">
                            {formatPercent((data.customers.returning / (data.customers.total || 1)) * 100)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 w-full text-[11px]">
                    {customerDistributionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-neutral-4">{item.name}</span>
                        </div>
                        <span className="font-semibold text-neutral-1">{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showProducts ? (
        <>
          {resolvedView === "products" ? (
            <div className="mb-6 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-1">Biểu đồ xếp hạng sản phẩm</p>
                  <p className="text-xs text-neutral-4">Top 5 sản phẩm bán chạy nhất hoặc doanh thu cao nhất</p>
                </div>
                <div className="flex rounded-lg border border-neutral-20 p-0.5 bg-neutral-10">
                  <button
                    type="button"
                    onClick={() => setProductChartTab("selling")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      productChartTab === "selling"
                        ? "bg-white text-neutral-1 shadow-sm"
                        : "text-neutral-4 hover:text-neutral-1"
                    }`}
                  >
                    Theo số lượng bán
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductChartTab("revenue")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      productChartTab === "revenue"
                        ? "bg-white text-neutral-1 shadow-sm"
                        : "text-neutral-4 hover:text-neutral-1"
                    }`}
                  >
                    Theo doanh thu
                  </button>
                </div>
              </div>

              <div className="mt-6 h-72">
                {((productChartTab === "selling" ? topSellingChartData : topRevenueChartData).length === 0) ? (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-4">
                    Chưa có dữ liệu sản phẩm để vẽ biểu đồ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={productChartTab === "selling" ? topSellingChartData : topRevenueChartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip
                        formatter={(value) => [
                          productChartTab === "revenue" ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                          productChartTab === "revenue" ? "Doanh thu" : "Số lượng",
                        ]}
                        labelFormatter={(label, items) => {
                          return items[0]?.payload?.fullName || label;
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill={productChartTab === "selling" ? "#d3242c" : "#f2bc57"}
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ) : null}

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
        </>
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
