"use server";

import { del, get, post, put } from "@/integrations/storeClient";

type UnknownRecord = Record<string, unknown>;

export interface AdminCoupon {
  id: string;
  code: string;
  discountType?: string;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCouponsMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminCouponsResult {
  success: boolean;
  message: string;
  data: {
    items: AdminCoupon[];
    meta: AdminCouponsMeta;
  };
}

export interface AdminCouponMutationResult {
  success: boolean;
  message: string;
  data: AdminCoupon | null;
}

export interface AdminCreateCouponPayload {
  code: string;
  discountType: string;
  discountValue: number;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export type AdminUpdateCouponPayload = Partial<AdminCreateCouponPayload>;

interface GetAdminCouponsInput {
  code?: string;
  discountType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const toNonNegativeInteger = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const getFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const getFirstNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }

  return undefined;
};

const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  return undefined;
};

const normalizeStatusToBoolean = (status?: string): boolean | undefined => {
  if (!status) {
    return undefined;
  }

  const normalized = status.trim().toLowerCase();

  if (["active", "enabled", "open", "on"].includes(normalized)) {
    return true;
  }

  if (["inactive", "disabled", "close", "closed", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
};

const createDefaultMeta = (page: number, limit: number, totalItems = 0): AdminCouponsMeta => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const normalizeCoupon = (value: unknown): AdminCoupon | null => {
  if (!isRecord(value)) {
    return null;
  }

  const code = getFirstString(value.code, value.couponCode);
  const id = getFirstString(value.id, value._id, code);

  if (!id) {
    return null;
  }

  const isActive =
    toOptionalBoolean(value.isActive) ??
    normalizeStatusToBoolean(getFirstString(value.status, value.state));

  return {
    id,
    code: code ?? id,
    discountType: getFirstString(value.discountType, value.type),
    discountValue: getFirstNumber(value.discountValue, value.value, value.amount),
    minOrderValue: getFirstNumber(value.minOrderValue, value.minOrderAmount),
    maxDiscount: getFirstNumber(value.maxDiscount, value.maxDiscountValue, value.maxDiscountAmount),
    usageLimit: getFirstNumber(value.usageLimit, value.maxUsage, value.maxUses),
    usedCount: getFirstNumber(value.usedCount, value.usageCount, value.used, value.totalUsed),
    isActive,
    startDate: getFirstString(value.startDate, value.startsAt, value.validFrom),
    endDate: getFirstString(value.endDate, value.endsAt, value.validUntil),
    description: getFirstString(value.description, value.note),
    createdAt: getFirstString(value.createdAt),
    updatedAt: getFirstString(value.updatedAt),
  };
};

const normalizeCouponCollection = (value: unknown): AdminCoupon[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeCoupon(item))
      .filter((item): item is AdminCoupon => Boolean(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.items)) {
    return normalizeCouponCollection(value.items);
  }

  if (Array.isArray(value.coupons)) {
    return normalizeCouponCollection(value.coupons);
  }

  if (isRecord(value.data) && Array.isArray(value.data.items)) {
    return normalizeCouponCollection(value.data.items);
  }

  if (isRecord(value.data) && Array.isArray(value.data.coupons)) {
    return normalizeCouponCollection(value.data.coupons);
  }

  const singleCoupon = normalizeCoupon(value);
  return singleCoupon ? [singleCoupon] : [];
};

const normalizeCouponDetail = (value: unknown): AdminCoupon | null => {
  const directCoupon = normalizeCoupon(value);
  if (directCoupon) {
    return directCoupon;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.coupon)) {
    return normalizeCoupon(value.coupon);
  }

  if (isRecord(value.data)) {
    return normalizeCoupon(value.data);
  }

  return null;
};

const pickMetaSource = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return undefined;
  }

  if (value.meta) {
    return value.meta;
  }

  if (value.pagination) {
    return value.pagination;
  }

  if (isRecord(value.data) && value.data.meta) {
    return value.data.meta;
  }

  if (isRecord(value.data) && value.data.pagination) {
    return value.data.pagination;
  }

  return undefined;
};

const normalizeMeta = (
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount: number
): AdminCouponsMeta => {
  if (!isRecord(value)) {
    return createDefaultMeta(fallbackPage, fallbackLimit, itemCount);
  }

  const page = toPositiveInteger(value.page, fallbackPage);
  const limit = toPositiveInteger(value.limit, fallbackLimit);
  const totalItems = toNonNegativeInteger(value.totalItems, itemCount);
  const defaultMeta = createDefaultMeta(page, limit, totalItems);

  return {
    page,
    limit,
    totalItems,
    totalPages: toPositiveInteger(value.totalPages, defaultMeta.totalPages),
    hasNextPage:
      typeof value.hasNextPage === "boolean"
        ? value.hasNextPage
        : defaultMeta.hasNextPage,
    hasPrevPage:
      typeof value.hasPrevPage === "boolean"
        ? value.hasPrevPage
        : defaultMeta.hasPrevPage,
  };
};

const sanitizeCouponPayload = (
  payload: AdminCreateCouponPayload | AdminUpdateCouponPayload
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};

  if (typeof payload.code === "string" && payload.code.trim().length > 0) {
    normalized.code = payload.code.trim().toUpperCase();
  }

  if (typeof payload.discountType === "string" && payload.discountType.trim().length > 0) {
    normalized.discountType = payload.discountType.trim();
  }

  if (typeof payload.discountValue === "number" && Number.isFinite(payload.discountValue)) {
    normalized.discountValue = payload.discountValue;
  }

  if (typeof payload.description === "string" && payload.description.trim().length > 0) {
    normalized.description = payload.description.trim();
  }

  if (typeof payload.minOrderValue === "number" && Number.isFinite(payload.minOrderValue)) {
    normalized.minOrderValue = payload.minOrderValue;
  }

  if (typeof payload.maxDiscount === "number" && Number.isFinite(payload.maxDiscount)) {
    normalized.maxDiscount = payload.maxDiscount;
  }

  if (typeof payload.usageLimit === "number" && Number.isFinite(payload.usageLimit)) {
    normalized.usageLimit = payload.usageLimit;
  }

  if (typeof payload.startDate === "string" && payload.startDate.trim().length > 0) {
    normalized.startDate = payload.startDate.trim();
  }

  if (typeof payload.endDate === "string" && payload.endDate.trim().length > 0) {
    normalized.endDate = payload.endDate.trim();
  }

  if (typeof payload.isActive === "boolean") {
    normalized.isActive = payload.isActive;
  }

  return normalized;
};

export const getAdminCoupons = async (
  input: GetAdminCouponsInput = {}
): Promise<AdminCouponsResult> => {
  const page = toPositiveInteger(input.page, 1);
  const limit = Math.min(toPositiveInteger(input.limit, 10), 100);

  const query: Record<string, string | number | boolean> = {
    page,
    limit,
  };

  if (input.code && input.code.trim().length > 0) {
    query.code = input.code.trim();
  }

  if (input.discountType && input.discountType.trim().length > 0) {
    query.discountType = input.discountType.trim();
  }

  if (typeof input.isActive === "boolean") {
    query.isActive = input.isActive;
  }

  const response = await get("/admin/coupons", query);
  const payload = response?.data;
  const items = normalizeCouponCollection(payload);
  const meta = normalizeMeta(pickMetaSource(payload), page, limit, items.length);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch coupons",
    data: {
      items,
      meta,
    },
  };
};

export const getAdminCouponById = async (
  couponId: string
): Promise<AdminCouponMutationResult> => {
  if (!couponId || couponId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid coupon id",
      data: null,
    };
  }

  const response = await get(`/admin/coupons/${couponId.trim()}`);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch coupon detail",
    data: normalizeCouponDetail(response?.data),
  };
};

export const createAdminCoupon = async (
  payload: AdminCreateCouponPayload
): Promise<AdminCouponMutationResult> => {
  const response = await post("/admin/coupons", sanitizeCouponPayload(payload));

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot create coupon",
    data: normalizeCouponDetail(response?.data),
  };
};

export const updateAdminCoupon = async (
  couponId: string,
  payload: AdminUpdateCouponPayload
): Promise<AdminCouponMutationResult> => {
  if (!couponId || couponId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid coupon id",
      data: null,
    };
  }

  const response = await put(
    `/admin/coupons/${couponId.trim()}`,
    sanitizeCouponPayload(payload)
  );

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot update coupon",
    data: normalizeCouponDetail(response?.data),
  };
};

export const deleteAdminCoupon = async (
  couponId: string
): Promise<{ success: boolean; message: string }> => {
  if (!couponId || couponId.trim().length === 0) {
    return {
      success: false,
      message: "Invalid coupon id",
    };
  }

  const response = await del(`/admin/coupons/${couponId.trim()}`);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot delete coupon",
  };
};
