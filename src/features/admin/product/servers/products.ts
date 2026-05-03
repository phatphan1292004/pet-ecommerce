"use server";

import { del, get, post, put } from "@/integrations/storeClient";

type UnknownRecord = Record<string, unknown>;

export interface AdminProductRef {
  id?: string;
  name?: string;
}

export interface AdminProduct {
  id: string;
  name?: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  brandName?: string;
  subCategoryName?: string;
  stock?: number;
  isActive?: boolean;
  status?: string;
  image?: string;
  images?: string[];
  description?: string;
  longDescription?: string;
  specifications?: string | UnknownRecord;
  benefits?: string | UnknownRecord;
  usage?: string;
  ingredients?: string;
  shipping?: string;
  review?: number;
  brand?: AdminProductRef;
  category?: AdminProductRef;
  subCategory?: AdminProductRef;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProductsMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminProductsResult {
  success: boolean;
  message: string;
  data: {
    items: AdminProduct[];
    meta: AdminProductsMeta;
  };
}

export interface AdminProductDetailResult {
  success: boolean;
  message: string;
  data: AdminProduct | null;
}

export interface AdminProductMutationResult {
  success: boolean;
  message: string;
  data: AdminProduct | null;
}

export interface AdminCreateProductPayload {
  name: string;
  price: number;
  brandId?: string;
  subCategoryId?: string;
  description?: string;
  originalPrice?: number;
  discount?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

export type AdminUpdateProductPayload = Partial<AdminCreateProductPayload>;

interface GetAdminProductsInput {
  search?: string;
  brandId?: string;
  subCategoryId?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
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

const getFirstContent = (...values: unknown[]): string | UnknownRecord | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (isRecord(value) && Object.keys(value).length > 0) {
      return value;
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

const normalizeEntity = (value: unknown): AdminProductRef | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return { name: value.trim() };
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const id = getFirstString(value.id, value._id);
  const name = getFirstString(value.name, value.title, value.label);

  if (!id && !name) {
    return undefined;
  }

  return { id, name };
};

const normalizeImageList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (isRecord(item)) {
        return getFirstString(item.url, item.src, item.path, item.image);
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
};

const normalizeProduct = (value: unknown): AdminProduct | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString(value.id, value._id, value.productId, value.slug);
  if (!id) {
    return null;
  }

  const status = getFirstString(value.status, value.state);
  const isActive =
    toOptionalBoolean(value.isActive) ??
    toOptionalBoolean(value.is_active) ??
    toOptionalBoolean(value.active) ??
    normalizeStatusToBoolean(status);

  const images = normalizeImageList(value.images ?? value.gallery ?? value.photos);
  const fallbackImage = getFirstString(value.image, value.thumbnail, value.coverImage, value.avatar);

  const brand =
    normalizeEntity(value.brand) ??
    normalizeEntity(getFirstString(value.brandName, value.brand)) ??
    normalizeEntity({ id: getFirstString(value.brandId, value.brand_id), name: value.brandName });

  const category =
    normalizeEntity(value.category) ??
    normalizeEntity(getFirstString(value.categoryName)) ??
    normalizeEntity({ id: getFirstString(value.categoryId), name: value.categoryName });

  const subCategory =
    normalizeEntity(value.subCategory ?? value.subcategory) ??
    normalizeEntity(getFirstString(value.subCategoryName, value.subcategoryName)) ??
    normalizeEntity({
      id: getFirstString(value.subCategoryId, value.subcategoryId),
      name: getFirstString(value.subCategoryName, value.subcategoryName),
    });

  return {
    id,
    name: getFirstString(value.name, value.title, value.productName),
    slug: getFirstString(value.slug),
    price: getFirstNumber(value.price, value.salePrice, value.finalPrice),
    originalPrice: getFirstNumber(
      value.originalPrice,
      value.original_price,
      value.priceOriginal,
      value.priceBeforeDiscount
    ),
    discount: getFirstNumber(value.discount, value.discountPercent, value.discount_rate),
    stock: getFirstNumber(value.stock, value.quantity, value.inventory),
    isActive,
    status,
    image: fallbackImage,
    images,
    description: getFirstString(value.description, value.shortDescription),
    longDescription: getFirstString(value.longDescription, value.long_description),
    specifications: getFirstContent(value.specifications, value.specification),
    benefits: getFirstContent(value.benefits),
    usage: getFirstString(value.usage, value.uses, value.howToUse),
    ingredients: getFirstString(value.ingredients),
    shipping: getFirstString(value.shipping, value.shippingInfo),
    review: getFirstNumber(value.review, value.rating),
    brand,
    category,
    subCategory,
    createdAt: getFirstString(value.createdAt, value.created_at),
    updatedAt: getFirstString(value.updatedAt, value.updated_at),
  };
};

const normalizeProductCollection = (value: unknown): AdminProduct[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeProduct(item))
      .filter((item): item is AdminProduct => Boolean(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.items)) {
    return normalizeProductCollection(value.items);
  }

  if (isRecord(value.data) && Array.isArray(value.data.items)) {
    return normalizeProductCollection(value.data.items);
  }

  if (Array.isArray(value.products)) {
    return normalizeProductCollection(value.products);
  }

  if (Array.isArray(value.data)) {
    return normalizeProductCollection(value.data);
  }

  return [];
};

const normalizeProductDetail = (value: unknown): AdminProduct | null => {
  const directProduct = normalizeProduct(value);
  if (directProduct) {
    return directProduct;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.data)) {
    return normalizeProduct(value.data);
  }

  if (isRecord(value.product)) {
    return normalizeProduct(value.product);
  }

  return null;
};

const createDefaultMeta = (page: number, limit: number, totalItems = 0): AdminProductsMeta => {
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

const normalizeMeta = (
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount: number
): AdminProductsMeta => {
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

export const getAdminProducts = async (
  input: GetAdminProductsInput = {}
): Promise<AdminProductsResult> => {
  const page = toPositiveInteger(input.page, 1);
  const limit = Math.min(toPositiveInteger(input.limit, 10), 100);

  const query: Record<string, string | number | boolean> = {
    page,
    limit,
  };

  if (input.search && input.search.trim().length > 0) {
    query.search = input.search.trim();
  }

  if (input.brandId && input.brandId.trim().length > 0) {
    query.brandId = input.brandId.trim();
  }

  if (input.subCategoryId && input.subCategoryId.trim().length > 0) {
    query.subCategoryId = input.subCategoryId.trim();
  }

  if (typeof input.isActive === "boolean") {
    query.isActive = input.isActive;
  }

  if (typeof input.minPrice === "number") {
    query.minPrice = input.minPrice;
  }

  if (typeof input.maxPrice === "number") {
    query.maxPrice = input.maxPrice;
  }

  if (input.sortBy && input.sortBy.trim().length > 0) {
    query.sortBy = input.sortBy.trim();
  }

  const response = await get("/admin/products", query);
  const payload = response?.data;
  const items = normalizeProductCollection(payload);
  const meta = normalizeMeta(pickMetaSource(payload), page, limit, items.length);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch products",
    data: {
      items,
      meta,
    },
  };
};

export const getAdminProductById = async (id: string): Promise<AdminProductDetailResult> => {
  const response = await get(`/admin/products/${id}`);
  const product = normalizeProductDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot fetch product",
    data: product,
  };
};

export const createAdminProduct = async (
  payload: AdminCreateProductPayload
): Promise<AdminProductMutationResult> => {
  const response = await post("/admin/products", payload);
  const product = normalizeProductDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot create product",
    data: product,
  };
};

export const updateAdminProduct = async (
  id: string,
  payload: AdminUpdateProductPayload
): Promise<AdminProductMutationResult> => {
  const response = await put(`/admin/products/${id}`, payload);
  const product = normalizeProductDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot update product",
    data: product,
  };
};

export const deleteAdminProduct = async (id: string): Promise<AdminProductMutationResult> => {
  const response = await del(`/admin/products/${id}`);
  const product = normalizeProductDetail(response?.data ?? response);

  return {
    success: Boolean(response?.success),
    message: response?.message || "Cannot delete product",
    data: product,
  };
};
