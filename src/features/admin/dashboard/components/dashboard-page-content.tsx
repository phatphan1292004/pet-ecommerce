"use client";

import type { IconType } from "react-icons";
import {
  FiActivity,
  FiDollarSign,
  FiMinus,
  FiPackage,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardData, AdminRecentActivity } from "@/features/admin/dashboard/servers";

interface DashboardPageContentProps {
  dashboard: AdminDashboardData;
  errorMessage?: string;
}

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString("vi-VN")} VND`;

const formatNumber = (value: number) => Math.round(value).toLocaleString("vi-VN");

const formatPercent = (value: number) =>
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;

const formatDateShort = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
  });
};

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

const activityTypeConfig = (type: string): { icon: IconType; className: string; label: string } => {
  const normalizedType = type.trim().toLowerCase();

  if (normalizedType === "order") {
    return {
      icon: FiPackage,
      className: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Order",
    };
  }

  if (normalizedType === "user") {
    return {
      icon: FiUsers,
      className: "bg-sky-50 text-sky-700 border-sky-200",
      label: "User",
    };
  }

  return {
    icon: FiActivity,
    className: "bg-neutral-10 text-neutral-3 border-neutral-20",
    label: "System",
  };
};

interface ChartTooltipPayloadItem {
  value?: number | string;
  name?: string;
  color?: string;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}

function ActivityItem({ activity }: { activity: AdminRecentActivity }) {
  const config = activityTypeConfig(activity.type);
  const Icon = config.icon;

  return (
    <li className="rounded-xl border border-neutral-20 bg-white p-3">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${config.className}`}
        >
          <Icon size={14} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-1">{activity.message}</p>
          <p className="mt-1 text-xs text-neutral-4">
            {config.label} · {formatDateTime(activity.createdAt)}
          </p>
        </div>
      </div>
    </li>
  );
}

function DashboardTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-neutral-20 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-neutral-2">{label}</p>
      <div className="mt-1 space-y-1 text-xs text-neutral-3">
        {payload.map((item, index) => (
          <p key={`${item.dataKey || item.name || "series"}-${index}`} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color || "#6d7580" }}
            />
            <span>{item.name || "Series"}:</span>
            <span className="font-semibold text-neutral-1">{formatNumber(Number(item.value) || 0)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPageContent({
  dashboard,
  errorMessage,
}: DashboardPageContentProps) {
  const overviewSeries = dashboard.overviewMonths;
  const chartData = overviewSeries.map((item) => ({
    label: formatDateShort(item.date),
    date: item.date,
    orders: item.orders,
    users: item.users,
  }));
  const chartOrders = chartData.map((item) => item.orders);
  const chartUsers = chartData.map((item) => item.users);

  const summaryCards: Array<{
    label: string;
    value: string;
    icon: IconType;
    iconClassName: string;
  }> = [
    {
      label: "Doanh thu thang nay",
      value: formatCurrency(dashboard.summary.revenueThisMonth),
      icon: FiDollarSign,
      iconClassName: "bg-primary-6 text-primary-1 border-primary-4",
    },
    {
      label: "Don moi hom nay",
      value: formatNumber(dashboard.summary.newOrdersToday),
      icon: FiPackage,
      iconClassName: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Nguoi dung moi",
      value: formatNumber(dashboard.summary.newUsersToday),
      icon: FiUserPlus,
      iconClassName: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Ty le hoan thanh",
      value: formatPercent(dashboard.summary.completionRate),
      icon: FiTrendingUp,
      iconClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-neutral-4">{card.label}</p>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${card.iconClassName}`}
                >
                  <Icon size={15} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-neutral-black">{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-black">Tổng quan 7 ngày</h2>
              <p className="text-sm text-neutral-4">Xu hướng đơn hàng và người dùng mới theo từng ngày</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-4 sm:gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Đơn hàng
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Người dùng
              </span>
            </div>
          </div>

          {overviewSeries.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-20 bg-neutral-10 p-4 text-sm text-neutral-4">
              Chưa có dữ liệu để hiển thị biểu đồ.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-neutral-20 bg-neutral-10 p-3 sm:p-4">
              <div className="h-64 w-full sm:h-72 lg:h-118">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ordersAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="usersAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      minTickGap={16}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6d7580", fontSize: 12 }}
                    />
                    <YAxis
                      width={32}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#86909c", fontSize: 12 }}
                    />
                    <Tooltip content={<DashboardTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Don hang"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fill="url(#ordersAreaGradient)"
                      dot={{ r: 4, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Nguoi dung"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#usersAreaGradient)"
                      dot={{ r: 4, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-4">
                <span className="inline-flex items-center gap-1.5">
                  <FiMinus size={12} className="text-cyan-500" />
                  Đơn cao nhất: {formatNumber(Math.max(...chartOrders, 0))}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiMinus size={12} className="text-indigo-500" />
                  Người dùng cao nhất: {formatNumber(Math.max(...chartUsers, 0))}
                </span>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-neutral-black">Hoạt động gần đây</h2>

          {dashboard.recentActivities.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-20 bg-neutral-10 p-4 text-sm text-neutral-4">
              Chưa có hoạt động gần đây.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {dashboard.recentActivities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.type}-${activity.createdAt || "no-time"}-${index}`}
                  activity={activity}
                />
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
