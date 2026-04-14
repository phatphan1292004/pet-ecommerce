"use server";

import { del, get } from "@/integrations/storeClient";

export interface AdminOrderItem {
  _id?: string;
  productId?: string;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
}

export interface AdminOrder {
  _id: string;
  customerId?: string;
  cartId?: string;
  status?: string;
  paymentMethod?: string;
  arrivalName?: string;
  arrivalPhone?: string;
  arrivalAddress?: string;
  totalPrice?: number;
  finalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  customerPhotoURL?: string;
}

export interface AdminOrderDetail extends AdminOrder {
  note?: string;
  cart?: {
    id?: string;
    status?: string;
    totalPrice?: number;
    totalDiscount?: number;
    finalPrice?: number;
    products?: AdminOrderItem[];
    createdAt?: string;
    updatedAt?: string;
  };
  products?: AdminOrderItem[];
  items?: AdminOrderItem[];
  cartItems?: AdminOrderItem[];
}

export interface AdminOrdersMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminOrdersResult {
  success: boolean;
  message: string;
  data: {
    items: AdminOrder[];
    meta: AdminOrdersMeta;
  };
}

export interface AdminOrderDetailResult {
  success: boolean;
  message: string;
  data: AdminOrderDetail | null;
}

interface GetAdminOrdersInput {
  page?: number;
  limit?: number;
  status?: string;
  keyword?: string;
}

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

const createDefaultMeta = (page: number, limit: number): AdminOrdersMeta => ({
  page,
  limit,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: page > 1,
});

const normalizeOrderItems = (payload: unknown): AdminOrder[] => {
  if (Array.isArray(payload)) {
    return payload as AdminOrder[];
  }

  if (payload && typeof payload === "object") {
    const typedPayload = payload as { items?: unknown };
    if (Array.isArray(typedPayload.items)) {
      return typedPayload.items as AdminOrder[];
    }
  }

  return [];
};

const normalizeOrderDetail = (payload: unknown): AdminOrderDetail | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return payload as AdminOrderDetail;
};

const normalizeMeta = (
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount: number
): AdminOrdersMeta => {
  const fallbackMeta = createDefaultMeta(fallbackPage, fallbackLimit);

  if (!payload || typeof payload !== "object") {
    return {
      ...fallbackMeta,
      totalItems: itemCount,
      totalPages: itemCount > 0 ? 1 : fallbackMeta.totalPages,
    };
  }

  const typedMeta = payload as Partial<AdminOrdersMeta>;
  const page = toPositiveInteger(typedMeta.page, fallbackPage);
  const limit = toPositiveInteger(typedMeta.limit, fallbackLimit);
  const totalItems = toNonNegativeInteger(typedMeta.totalItems, itemCount);
  const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / limit));
  const totalPages = Math.max(
    1,
    toPositiveInteger(typedMeta.totalPages, calculatedTotalPages)
  );

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage:
      typeof typedMeta.hasNextPage === "boolean"
        ? typedMeta.hasNextPage
        : page < totalPages,
    hasPrevPage:
      typeof typedMeta.hasPrevPage === "boolean"
        ? typedMeta.hasPrevPage
        : page > 1,
  };
};

export const getAdminOrders = async (
  input: GetAdminOrdersInput = {}
): Promise<AdminOrdersResult> => {
  const page = toPositiveInteger(input.page, 1);
  const limit = Math.min(toPositiveInteger(input.limit, 10), 100);

  const query: Record<string, string | number> = {
    page,
    limit,
  };

  if (input.status && input.status.trim().length > 0) {
    query.status = input.status.trim();
  }

  if (input.keyword && input.keyword.trim().length > 0) {
    query.keyword = input.keyword.trim();
  }

  const res = await get("/admin/orders", query);
  const payload = res?.data;

  const items = normalizeOrderItems(payload);
  const metaSource =
    payload && typeof payload === "object"
      ? (payload as { meta?: unknown }).meta
      : undefined;
  const meta = normalizeMeta(metaSource, page, limit, items.length);

  return {
    success: Boolean(res?.success),
    message: res?.message || "Kh�ng th? t?i danh s�ch don h�ng",
    data: {
      items,
      meta,
    },
  };
};

export const getAdminOrderById = async (orderId: string): Promise<AdminOrderDetailResult> => {
  if (!orderId || orderId.trim().length === 0) {
    return {
      success: false,
      message: "ID don hang khong hop le",
      data: null,
    };
  }

  const res = await get(`/admin/orders/${orderId.trim()}`);

  return {
    success: Boolean(res?.success),
    message: res?.message || "Kh�ng th? t?i chi ti?t don h�ng",
    data: normalizeOrderDetail(res?.data),
  };
};

export const deleteAdminOrder = async (
  orderId: string
): Promise<{ success: boolean; message: string }> => {
  if (!orderId || orderId.trim().length === 0) {
    return {
      success: false,
      message: "ID don h�ng kh�ng h?p l?",
    };
  }

  const res = await del(`/admin/orders/${orderId.trim()}`);

  return {
    success: Boolean(res?.success),
    message: res?.message || "Kh�ng th? x�a don h�ng",
  };
};
