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
  specifications?: Record<string, string | number>;
  benefits?: Record<string, string>;
  created_at?: string;
}

export const getLatestProducts = async (): Promise<Product[] | null> => {
  const res = await get(`/products/latest`);
  return res?.data ?? null;
};

export const getProductBySlug = async (slug: string): Promise<ProductDetail | null> => {
  const res = await get(`/products/${slug}`);
  return res?.data ?? null;
};

