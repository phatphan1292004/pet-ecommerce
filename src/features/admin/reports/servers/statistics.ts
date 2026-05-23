"use server";

import { get } from "@/integrations/storeClient";

type UnknownRecord = Record<string, unknown>;

export interface AdminStatisticsSeriesItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminStatisticsProductItem {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  quantity?: number;
  revenue?: number;
  stock?: number;
}

export interface AdminStatisticsCustomerSpender {
  id: string;
  name: string;
  totalSpent: number;
  orders: number;
}

export interface AdminStatisticsData {
  revenue: {
    today: number;
    month: number;
    year: number;
    series: {
      last7Days: AdminStatisticsSeriesItem[];
      last30Days: AdminStatisticsSeriesItem[];
      last6Months: AdminStatisticsSeriesItem[];
      last12Months: AdminStatisticsSeriesItem[];
    };
  };
  orders: {
    total: number;
    pending: number;
    delivering: number;
    delivered: number;
    cancelled: number;
    cancellationRate: number;
  };
  products: {
    topSelling: AdminStatisticsProductItem[];
    topRevenue: AdminStatisticsProductItem[];
    lowStock: AdminStatisticsProductItem[];
    highStock: AdminStatisticsProductItem[];
    lowSelling: AdminStatisticsProductItem[];
  };
  customers: {
    total: number;
    newToday: number;
    newThisMonth: number;
    newThisYear: number;
    returning: number;
    topSpenders: AdminStatisticsCustomerSpender[];
    newCustomersSeriesLast30Days: AdminStatisticsSeriesItem[];
  };
}

export interface AdminStatisticsResult {
  success: boolean;
  message: string;
  data: AdminStatisticsData;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toStringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const toSeries = (value: unknown): AdminStatisticsSeriesItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const date = toStringValue(item.date);
      if (!date) {
        return null;
      }

      return {
        date,
        revenue: toNumber(item.revenue),
        orders: toNumber(item.orders),
      } as AdminStatisticsSeriesItem;
    })
    .filter((item): item is AdminStatisticsSeriesItem => Boolean(item));
};

const toProducts = (value: unknown): AdminStatisticsProductItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = toStringValue(item.id, "").trim();
      if (!id) {
        return null;
      }

      return {
        id,
        name: toStringValue(item.name, ""),
        slug: toStringValue(item.slug, "") || undefined,
        image: toStringValue(item.image, "") || undefined,
        quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : undefined,
        revenue: Number.isFinite(Number(item.revenue)) ? Number(item.revenue) : undefined,
        stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : undefined,
      } as AdminStatisticsProductItem;
    })
    .filter((item): item is AdminStatisticsProductItem => Boolean(item));
};

const toTopSpenders = (value: unknown): AdminStatisticsCustomerSpender[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = toStringValue(item.id, "").trim();
      if (!id) {
        return null;
      }

      return {
        id,
        name: toStringValue(item.name, ""),
        totalSpent: toNumber(item.totalSpent),
        orders: toNumber(item.orders),
      } as AdminStatisticsCustomerSpender;
    })
    .filter((item): item is AdminStatisticsCustomerSpender => Boolean(item));
};

const defaultData = (): AdminStatisticsData => ({
  revenue: {
    today: 0,
    month: 0,
    year: 0,
    series: {
      last7Days: [],
      last30Days: [],
      last6Months: [],
      last12Months: [],
    },
  },
  orders: {
    total: 0,
    pending: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
    cancellationRate: 0,
  },
  products: {
    topSelling: [],
    topRevenue: [],
    lowStock: [],
    highStock: [],
    lowSelling: [],
  },
  customers: {
    total: 0,
    newToday: 0,
    newThisMonth: 0,
    newThisYear: 0,
    returning: 0,
    topSpenders: [],
    newCustomersSeriesLast30Days: [],
  },
});

const normalizeData = (value: unknown): AdminStatisticsData => {
  if (!isRecord(value)) {
    return defaultData();
  }

  const revenueRecord = isRecord(value.revenue) ? value.revenue : {};
  const seriesRecord = isRecord(revenueRecord.series) ? revenueRecord.series : {};
  const ordersRecord = isRecord(value.orders) ? value.orders : {};
  const productsRecord = isRecord(value.products) ? value.products : {};
  const customersRecord = isRecord(value.customers) ? value.customers : {};

  return {
    revenue: {
      today: toNumber(revenueRecord.today),
      month: toNumber(revenueRecord.month),
      year: toNumber(revenueRecord.year),
      series: {
        last7Days: toSeries(seriesRecord.last7Days),
        last30Days: toSeries(seriesRecord.last30Days),
        last6Months: toSeries(seriesRecord.last6Months),
        last12Months: toSeries(seriesRecord.last12Months),
      },
    },
    orders: {
      total: toNumber(ordersRecord.total),
      pending: toNumber(ordersRecord.pending),
      delivering: toNumber(ordersRecord.delivering),
      delivered: toNumber(ordersRecord.delivered),
      cancelled: toNumber(ordersRecord.cancelled),
      cancellationRate: toNumber(ordersRecord.cancellationRate),
    },
    products: {
      topSelling: toProducts(productsRecord.topSelling),
      topRevenue: toProducts(productsRecord.topRevenue),
      lowStock: toProducts(productsRecord.lowStock),
      highStock: toProducts(productsRecord.highStock),
      lowSelling: toProducts(productsRecord.lowSelling),
    },
    customers: {
      total: toNumber(customersRecord.total),
      newToday: toNumber(customersRecord.newToday),
      newThisMonth: toNumber(customersRecord.newThisMonth),
      newThisYear: toNumber(customersRecord.newThisYear),
      returning: toNumber(customersRecord.returning),
      topSpenders: toTopSpenders(customersRecord.topSpenders),
      newCustomersSeriesLast30Days: toSeries(customersRecord.newCustomersSeriesLast30Days),
    },
  };
};

export const getAdminStatistics = async (): Promise<AdminStatisticsResult> => {
  const response = await get("/admin/statistics");

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch statistics",
    data: normalizeData(response?.data),
  };
};
