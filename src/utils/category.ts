import { type Product } from "@/features/guest/product/components/product-card";
import { type Category, type Subcategory } from "@/types/category";

export interface SidebarCategory extends Omit<Category, "subcategories"> {
  subcategories: Subcategory[];
}

export interface CategoryBrandFilterOption {
  id: string;
  name: string;
}

export interface RawProduct extends Product {
  images?: string[];
}

const EXCLUDED_CATEGORY_SLUGS = ["nhan-hang", "brands", "brand"];
const EXCLUDED_CATEGORY_NAMES = ["nhan hang", "nhãn hàng"];

export const ORIGIN_FILTERS = ["Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Mỹ"];

export const isItemActive = (item: { is_active?: boolean; isActive?: boolean }) => {
  if (typeof item.is_active === "boolean") return item.is_active;
  if (typeof item.isActive === "boolean") return item.isActive;
  return true;
};

export const shouldShowCategory = (category: { slug?: string; name?: string }) => {
  const slug = (category.slug ?? "").trim().toLowerCase();
  const name = (category.name ?? "").trim().toLowerCase();

  return !EXCLUDED_CATEGORY_SLUGS.includes(slug) && !EXCLUDED_CATEGORY_NAMES.includes(name);
};

export const mapToProductCard = (item: RawProduct): Product => {
  const image =
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "") ||
    "/logo.png";

  return {
    _id: item._id,
    name: item.name,
    price: item.price,
    originalPrice: item.originalPrice,
    discount: item.discount,
    review: item.review,
    slug: item.slug,
    image,
  };
};
