'use server'

import { get } from "@/integrations/storeClient";
import { Product } from "@/features/guest/product/components/product-card";

export interface ProductDetail extends Product {
  brand?: string;
  description?: string;
  longDescription?: string;
  images?: string[];
  stock?: number;
  shipping?: string;
  is_active?: boolean;
  isFavorite?: boolean;
  is_favorite?: boolean;
  specifications?: Record<string, string | number>;
  benefits?: Record<string, string>;
  usage?: string;
  ingredients?: string;
  created_at?: string;
}

interface ProductListResponse {
  data?: Product[];
  products?: Product[];
  items?: Product[];
}

export interface FilterProductsParams {
  subCategoryIds?: string[];
  brandIds?: string[];
  origins?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  keyword?: string;
}

const normalizeProducts = (payload: unknown): Product[] => {
  if (Array.isArray(payload)) {
    return payload as Product[];
  }

  if (payload && typeof payload === "object") {
    const typedPayload = payload as ProductListResponse;
    if (Array.isArray(typedPayload.data)) return typedPayload.data;
    if (Array.isArray(typedPayload.products)) return typedPayload.products;
    if (Array.isArray(typedPayload.items)) return typedPayload.items;
  }

  return [];
};

export const getLatestProducts = async (): Promise<Product[] | null> => {
  const res = await get(`/products/latest`);
  return res?.data ?? null;
};

export const getPopularProducts = async (): Promise<Product[] | null> => {
  const res = await get(`/products/popular`);
  return res?.data ?? null;
};

export const getBestSellingProducts = async (): Promise<Product[] | null> => {
  const res = await get(`/products/best-selling`);
  return res?.data ?? null;
};

export const getProductBySlug = async (
  slug: string,
  customerId?: string
): Promise<ProductDetail | null> => {
  const query = customerId ? { customerId } : undefined;
  const res = await get(`/products/${slug}`, query);
  return res?.data ?? null;
};

export const getProductsBySubcategory = async (subcategoryId: string): Promise<Product[]> => {
  const res = await get(`/products/subcategory/${subcategoryId}`, undefined, { data: [] });
  return normalizeProducts(res?.data ?? res);
};

export const getFilteredProducts = async (params: FilterProductsParams): Promise<Product[]> => {
  const normalizedParams: Record<string, string | number> = {};

  if (params.subCategoryIds && params.subCategoryIds.length > 0) {
    normalizedParams.subcategoryIds = params.subCategoryIds.join(",");
  }

  if (params.brandIds && params.brandIds.length > 0) {
    normalizedParams.brandIds = params.brandIds.join(",");
  }

  if (params.origins && params.origins.length > 0) {
    normalizedParams.origins = params.origins.join(",");
  }

  if (typeof params.minPrice === "number") normalizedParams.minPrice = params.minPrice;
  if (typeof params.maxPrice === "number") normalizedParams.maxPrice = params.maxPrice;
  if (typeof params.sortBy === "string" && params.sortBy.trim().length > 0) {
    normalizedParams.sortBy = params.sortBy;
  }
  if (typeof params.page === "number") normalizedParams.page = params.page;
  if (typeof params.limit === "number") normalizedParams.limit = params.limit;
  if (typeof params.keyword === "string" && params.keyword.trim().length > 0) {
    normalizedParams.keyword = params.keyword;
  }

  const res = await get(`/products/filter`, normalizedParams, { data: [] });
  return normalizeProducts(res?.data ?? res);
};

