import { getBrands } from "@/features/guest/brand";
import { getCategories, getSubCategories } from "@/features/guest/category";
import CategoryProductsPage from "@/features/guest/category/components/category-products-page";
import { getFilteredProducts } from "@/features/guest/product/servers";
import {
  type CategoryBrandFilterOption,
  isItemActive,
  mapToProductCard,
  shouldShowCategory,
  type RawProduct,
  type SidebarCategory,
} from "@/utils/category";

interface CategoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getSearchParamValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseCsvParam = (value: string | undefined): string[] => {
  if (!value || value.trim().length === 0) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumberParam = (value: string | undefined): number | undefined => {
  if (!value || value.trim().length === 0) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const isObjectId = (value: string | undefined): value is string => {
  if (!value) return false;
  return OBJECT_ID_REGEX.test(value);
};

const normalizeBrandToken = (value: string): string =>
  value
    .replace(/\+/g, " ")
    .trim()
    .toLowerCase();

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const query = await searchParams;
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  const sidebarCategories: SidebarCategory[] = await Promise.all(
    (categories ?? [])
      .filter((category) => isItemActive(category) && shouldShowCategory(category))
      .map(async (category) => {
        const subcategories = (await getSubCategories(category._id)) ?? [];
        return {
          ...category,
          subcategories,
        };
      }),
  );

  const brandIds = parseCsvParam(getSearchParamValue(query.brandIds));
  const origins = parseCsvParam(getSearchParamValue(query.origins));
  const minPrice = parseNumberParam(getSearchParamValue(query.minPrice));
  const maxPrice = parseNumberParam(getSearchParamValue(query.maxPrice));
  const sortBy = getSearchParamValue(query.sortBy);
  const page = parseNumberParam(getSearchParamValue(query.page));
  const limit = parseNumberParam(getSearchParamValue(query.limit));
  const keyword = getSearchParamValue(query.keyword);
  const productType = getSearchParamValue(query.productType);

  const activeBrandFilters: CategoryBrandFilterOption[] = brands
    .filter((brand) => isItemActive(brand) && Boolean(brand.name))
    .map((brand) => {
      const rawBrandId = [brand._id, brand.id]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .find((value) => value.length > 0);

      if (!isObjectId(rawBrandId)) {
        return null;
      }

      return {
        id: rawBrandId,
        name: brand.name,
      };
    })
    .filter((brand): brand is CategoryBrandFilterOption => Boolean(brand));

  const brandTokenToId = brands.reduce<Map<string, string>>((map, brand) => {
    if (!isItemActive(brand) || !brand.name) {
      return map;
    }

    const rawBrandId = [brand._id, brand.id]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .find((value) => value.length > 0);

    if (!isObjectId(rawBrandId)) {
      return map;
    }

    map.set(rawBrandId, rawBrandId);
    map.set(normalizeBrandToken(brand.name), rawBrandId);

    if (typeof brand.slug === "string" && brand.slug.trim().length > 0) {
      map.set(normalizeBrandToken(brand.slug), rawBrandId);
    }

    return map;
  }, new Map<string, string>());

  const normalizedBrandIds = brandIds
    .map((token) => {
      const trimmedToken = token.trim();

      if (isObjectId(trimmedToken)) {
        return trimmedToken;
      }

      return brandTokenToId.get(normalizeBrandToken(trimmedToken));
    })
    .filter((value): value is string => Boolean(value));

  const dedupedBrandIds = [...new Set(normalizedBrandIds)];

  const products = await getFilteredProducts({
    brandIds: dedupedBrandIds,
    origins,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
    keyword,
    productType,
  });

  const normalizedProducts = products.map((item) => mapToProductCard(item as RawProduct));
  const activeSidebarCategories = sidebarCategories.map((item) => ({
    ...item,
    subcategories: item.subcategories.filter((sub) => isItemActive(sub)),
  }));

  return (
    <CategoryProductsPage
      key={JSON.stringify({
        brandIds: dedupedBrandIds,
        origins,
        minPrice,
        maxPrice,
        sortBy,
        page,
        limit,
        keyword,
        productType,
      })}
      sidebarCategories={activeSidebarCategories}
      currentCategorySlug=""
      categoryName="Tất cả sản phẩm"
      brandFilters={activeBrandFilters}
      initialSelectedBrandIds={dedupedBrandIds}
      initialSelectedOrigins={origins}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
      initialSelectedProductType={productType}
      products={normalizedProducts}
    />
  );
}
