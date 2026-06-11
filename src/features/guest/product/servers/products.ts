'use server'

import { get, post } from "@/integrations/storeClient";
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

interface DiscountProgramProductItem {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  image?: string;
  slug?: string;
}

interface DiscountProgramWithProductsResponse {
  data?: {
    program?: {
      name?: string;
      startDate?: string;
      endDate?: string;
    };
    products?: {
      items?: DiscountProgramProductItem[];
    };
  };
}

export interface DiscountProgramSectionData {
  name: string;
  startDate?: string;
  endDate?: string;
  products: Product[];
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
  productType?: string;
}

export interface TrackProductActivityInput {
  customerId?: string;
  productId: string;
  action?: "view" | "click";
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

export const getDiscountProgramProducts = async (): Promise<DiscountProgramSectionData | null> => {
  const res = await get(`/discount-programs/with-products`, undefined, { data: {} });
  const payload = (res ?? {}) as DiscountProgramWithProductsResponse;
  const program = payload.data?.program;
  const items = payload.data?.products?.items;

  if (!Array.isArray(items)) {
    return null;
  }

  const products = items
    .map((item) => {
      const id = item._id ?? item.id;
      const image = Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : item.image;

      if (!id || !item.name || typeof item.price !== "number" || !image) {
        return null;
      }

      return {
        _id: id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount,
        image,
        slug: item.slug,
      } as Product;
    })
    .filter((product): product is Product => Boolean(product));

  if (products.length === 0) {
    return null;
  }

  return {
    name: program?.name?.trim() || "CHUONG TRINH GIAM GIA",
    startDate: program?.startDate,
    endDate: program?.endDate,
    products,
  };
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
  if (typeof params.productType === "string" && params.productType.trim().length > 0) {
    normalizedParams.productType = params.productType;
  }

  const res = await get(`/products/filter`, normalizedParams, { data: [] });
  return normalizeProducts(res?.data ?? res);
};

export const trackProductActivity = async (
  customerId: string | undefined,
  productId: string,
  action: "view" | "click" = "view"
): Promise<{ success: boolean; message?: string } | null> => {
  if (!productId) {
    return null;
  }

  if (!customerId) {
    console.warn(`[trackProductActivity] Skipped tracking because customerId is undefined`);
    return null;
  }

  const payload: TrackProductActivityInput = {
    productId,
    action,
    customerId,
  };

  return post(`/products/track`, payload);
};

export const getRecommendedProductsForCustomer = async (
  customerId: string,
  limit = 10,
  historyLimit = 20
): Promise<Product[]> => {
  if (!customerId) {
    return [];
  }

  const res = await get(
    `/products/recommendations`,
    { customerId, limit, historyLimit },
    { data: [] }
  );

  return normalizeProducts(res?.data ?? res);
};

