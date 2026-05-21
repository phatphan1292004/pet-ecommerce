"use server";

import { del, get, post, put } from "@/integrations/storeClient";

type UnknownRecord = Record<string, unknown>;

export interface AdminDiscountProgram {
  id: string;
  name?: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  description?: string;
  productIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDiscountProgramsMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminDiscountProgramsResult {
  success: boolean;
  message: string;
  data: {
    items: AdminDiscountProgram[];
    meta: AdminDiscountProgramsMeta;
  };
}

export interface AdminDiscountProgramMutationResult {
  success: boolean;
  message: string;
  data: AdminDiscountProgram | null;
}

export interface AdminCreateDiscountProgramPayload {
  name: string;
  code: string;
  discountType: string;
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  description?: string;
  productIds?: string[];
}

export type AdminUpdateDiscountProgramPayload = Partial<AdminCreateDiscountProgramPayload>;

export interface AdminDiscountProgramProductsResult {
  success: boolean;
  message: string;
  data: {
    items: UnknownRecord[];
    meta: AdminDiscountProgramsMeta;
  };
}

interface GetAdminDiscountProgramsInput {
  search?: string;
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

const createDefaultMeta = (page: number, limit: number, totalItems = 0): AdminDiscountProgramsMeta => {
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

const normalizeProgram = (value: unknown): AdminDiscountProgram | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString(value.id, value._id);
  if (!id) {
    return null;
  }

  const productIds = Array.isArray(value.productIds)
    ? value.productIds.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id,
    name: getFirstString(value.name),
    code: getFirstString(value.code),
    discountType: getFirstString(value.discountType, value.type),
    discountValue: getFirstNumber(value.discountValue, value.value, value.amount),
    startDate: getFirstString(value.startDate),
    endDate: getFirstString(value.endDate),
    isActive: toOptionalBoolean(value.isActive),
    description: getFirstString(value.description),
    productIds,
    createdAt: getFirstString(value.createdAt),
    updatedAt: getFirstString(value.updatedAt),
  };
};

const normalizeProgramsCollection = (value: unknown): AdminDiscountProgram[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeProgram(item))
      .filter((item): item is AdminDiscountProgram => Boolean(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.items)) {
    return normalizeProgramsCollection(value.items);
  }

  if (isRecord(value.data) && Array.isArray(value.data.items)) {
    return normalizeProgramsCollection(value.data.items);
  }

  const singleProgram = normalizeProgram(value);
  return singleProgram ? [singleProgram] : [];
};

const normalizeProgramDetail = (value: unknown): AdminDiscountProgram | null => {
  const directProgram = normalizeProgram(value);
  if (directProgram) {
    return directProgram;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.data)) {
    return normalizeProgram(value.data);
  }

  return null;
};

const normalizeMeta = (
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount = 0
): AdminDiscountProgramsMeta => {
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

const pickMetaSource = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return undefined;
  }

  if (value.meta) {
    return value.meta;
  }

  if (isRecord(value.data) && value.data.meta) {
    return value.data.meta;
  }

  return undefined;
};

export const getAdminDiscountPrograms = async (
  input: GetAdminDiscountProgramsInput = {}
): Promise<AdminDiscountProgramsResult> => {
  const page = toPositiveInteger(input.page, 1);
  const limit = Math.min(toPositiveInteger(input.limit, 10), 100);

  const query: Record<string, string | number | boolean> = {
    page,
    limit,
  };

  if (input.search && input.search.trim().length > 0) {
    query.search = input.search.trim();
  }

  if (input.discountType && input.discountType.trim().length > 0) {
    query.discountType = input.discountType.trim();
  }

  if (typeof input.isActive === "boolean") {
    query.isActive = input.isActive;
  }

  const response = await get("/admin/discount-programs", query);
  const payload = response?.data ?? response;
  const items = normalizeProgramsCollection(payload?.items ?? payload);
  const meta = normalizeMeta(pickMetaSource(payload), page, limit, items.length);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch discount programs",
    data: {
      items,
      meta,
    },
  };
};

export const getAdminDiscountProgramById = async (
  id: string
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await get(`/admin/discount-programs/${id}`);
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch discount program",
    data: program,
  };
};

export const createAdminDiscountProgram = async (
  payload: AdminCreateDiscountProgramPayload
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await post("/admin/discount-programs", payload);
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot create discount program",
    data: program,
  };
};

export const updateAdminDiscountProgram = async (
  id: string,
  payload: AdminUpdateDiscountProgramPayload
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await put(`/admin/discount-programs/${id}`, payload);
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot update discount program",
    data: program,
  };
};

export const deleteAdminDiscountProgram = async (
  id: string
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await del(`/admin/discount-programs/${id}`);
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot delete discount program",
    data: program,
  };
};

export const getAdminDiscountProgramProducts = async (
  id: string,
  page = 1,
  limit = 10
): Promise<AdminDiscountProgramProductsResult> => {
  const response = await get(`/admin/discount-programs/${id}/products`, { page, limit });
  const payload = response?.data ?? response;
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const meta = normalizeMeta(pickMetaSource(payload), page, limit, items.length);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch discount program products",
    data: { items, meta },
  };
};

export const addProductsToDiscountProgram = async (
  id: string,
  productIds: string[]
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await post(`/admin/discount-programs/${id}/products`, { productIds });
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot add products",
    data: program,
  };
};

export const removeProductsFromDiscountProgram = async (
  id: string,
  productIds: string[]
): Promise<AdminDiscountProgramMutationResult> => {
  const response = await del(`/admin/discount-programs/${id}/products`, { productIds });
  const program = normalizeProgramDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot remove products",
    data: program,
  };
};
