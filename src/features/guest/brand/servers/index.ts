"use server";

import { get } from "@/integrations/storeClient";

export interface BrandItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  icon?: string;
  is_active?: boolean;
  isActive?: boolean;
}

interface BrandListResponse {
  data?: BrandItem[];
  brands?: BrandItem[];
  items?: BrandItem[];
}

const normalizeBrands = (payload: unknown): BrandItem[] => {
  if (Array.isArray(payload)) {
    return payload as BrandItem[];
  }

  if (payload && typeof payload === "object") {
    const typedPayload = payload as BrandListResponse;
    if (Array.isArray(typedPayload.data)) return typedPayload.data;
    if (Array.isArray(typedPayload.brands)) return typedPayload.brands;
    if (Array.isArray(typedPayload.items)) return typedPayload.items;
  }

  return [];
};

export const getBrands = async (): Promise<BrandItem[]> => {
  const res = await get("/brands", undefined, { data: [] });
  return normalizeBrands(res?.data ?? res);
};
