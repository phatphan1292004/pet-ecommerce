'use server'

import { get } from "@/integrations/storeClient";
import { Category, Subcategory } from "@/types/category";

export const getCategories = async (): Promise<Category[] | null> => {
  const res = await get(`/categories`);
  return res?.data ?? null;
};

export const getSubCategories = async (categoryId: string): Promise<Subcategory[] | null> => {
  const res = await get(`/categories/${categoryId}/subcategories`);
  return res?.data ?? null;
};