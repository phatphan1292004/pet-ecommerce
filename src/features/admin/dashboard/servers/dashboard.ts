"use server";

import { get } from "@/integrations/storeClient";

export interface AdminDashboardSummary {
  revenueToday: number;
  newOrdersToday: number;
  newUsersToday: number;
  completionRate: number;
}

export interface AdminDashboardOverviewItem {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

export interface AdminRecentActivity {
  type: string;
  message: string;
  createdAt?: string;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  overview7Days: AdminDashboardOverviewItem[];
  recentActivities: AdminRecentActivity[];
}

export interface AdminDashboardResult {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const defaultSummary = (): AdminDashboardSummary => ({
  revenueToday: 0,
  newOrdersToday: 0,
  newUsersToday: 0,
  completionRate: 0,
});

const normalizeSummary = (value: unknown): AdminDashboardSummary => {
  if (!isRecord(value)) {
    return defaultSummary();
  }

  return {
    revenueToday: toNumber(value.revenueToday, 0),
    newOrdersToday: toNumber(value.newOrdersToday, 0),
    newUsersToday: toNumber(value.newUsersToday, 0),
    completionRate: toNumber(value.completionRate, 0),
  };
};

const normalizeOverviewItem = (value: unknown): AdminDashboardOverviewItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const date = toStringValue(value.date);
  if (!date) {
    return null;
  }

  return {
    date,
    revenue: toNumber(value.revenue, 0),
    orders: toNumber(value.orders, 0),
    users: toNumber(value.users, 0),
  };
};

const normalizeRecentActivity = (value: unknown): AdminRecentActivity | null => {
  if (!isRecord(value)) {
    return null;
  }

  const message = toStringValue(value.message);
  if (!message) {
    return null;
  }

  return {
    type: toStringValue(value.type, "system"),
    message,
    createdAt: toStringValue(value.createdAt) || undefined,
  };
};

const normalizeDashboardData = (value: unknown): AdminDashboardData => {
  if (!isRecord(value)) {
    return {
      summary: defaultSummary(),
      overview7Days: [],
      recentActivities: [],
    };
  }

  const overviewSource = Array.isArray(value.overview7Days) ? value.overview7Days : [];
  const overview7Days = overviewSource
    .map((item) => normalizeOverviewItem(item))
    .filter((item): item is AdminDashboardOverviewItem => Boolean(item));

  const activitiesSource = Array.isArray(value.recentActivities) ? value.recentActivities : [];
  const recentActivities = activitiesSource
    .map((item) => normalizeRecentActivity(item))
    .filter((item): item is AdminRecentActivity => Boolean(item));

  return {
    summary: normalizeSummary(value.summary),
    overview7Days,
    recentActivities,
  };
};

export const getAdminDashboard = async (): Promise<AdminDashboardResult> => {
  const response = await get("/admin/dashboard");

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch dashboard data",
    data: normalizeDashboardData(response?.data),
  };
};
