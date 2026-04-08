"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import CategorySidebar from "@/features/guest/category/components/category-sidebar";
import ProductCard, {
  type Product,
} from "@/features/guest/product/components/product-card";
import {
  type CategoryBrandFilterOption,
  type SidebarCategory,
} from "@/utils/category";

interface CategoryProductsPageProps {
  sidebarCategories: SidebarCategory[];
  currentCategorySlug: string;
  currentSubcategorySlug?: string;
  categoryName: string;
  subcategoryName?: string;
  brandFilters: CategoryBrandFilterOption[];
  initialSelectedBrandIds: string[];
  initialSelectedOrigins: string[];
  initialMinPrice?: number;
  initialMaxPrice?: number;
  products: Product[];
}

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5_000_000;

const normalizeBrandToken = (value: string): string =>
  value
    .replace(/\+/g, " ")
    .trim()
    .toLowerCase();

export default function CategoryProductsPage({
  sidebarCategories,
  currentCategorySlug,
  currentSubcategorySlug,
  categoryName,
  subcategoryName,
  brandFilters,
  initialSelectedBrandIds,
  initialSelectedOrigins,
  initialMinPrice,
  initialMaxPrice,
  products,
}: CategoryProductsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const minPrice = DEFAULT_MIN_PRICE;
  const maxPrice = DEFAULT_MAX_PRICE;

  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialSelectedBrandIds);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(initialSelectedOrigins);
  const [draftMinPrice, setDraftMinPrice] = useState(initialMinPrice ?? minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(initialMaxPrice ?? maxPrice);

  const brandTokenToId = useMemo(() => {
    const map = new Map<string, string>();

    for (const brand of brandFilters) {
      map.set(brand.id, brand.id);
      map.set(normalizeBrandToken(brand.id), brand.id);
      map.set(normalizeBrandToken(brand.name), brand.id);
    }

    return map;
  }, [brandFilters]);

  const toggleSelection = (
    value: string,
    selectedValues: string[],
    setSelectedValues: (values: string[]) => void,
  ) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
      return;
    }

    setSelectedValues([...selectedValues, value]);
  };

  const handleApplyFilter = () => {
    const nextParams = new URLSearchParams(currentSearchParams.toString());
    const normalizedMinPrice = Math.min(draftMinPrice, draftMaxPrice);
    const normalizedMaxPrice = Math.max(draftMinPrice, draftMaxPrice);
    const normalizedSelectedBrandIds = [...new Set(
      selectedBrands
        .map((token) => {
          const trimmedToken = token.trim();

          if (OBJECT_ID_REGEX.test(trimmedToken)) {
            return trimmedToken;
          }

          return brandTokenToId.get(normalizeBrandToken(trimmedToken));
        })
        .filter((value): value is string => Boolean(value)),
    )];

    if (normalizedSelectedBrandIds.length > 0) {
      nextParams.set("brandIds", normalizedSelectedBrandIds.join(","));
    } else {
      nextParams.delete("brandIds");
    }

    if (selectedOrigins.length > 0) {
      nextParams.set("origins", selectedOrigins.join(","));
    } else {
      nextParams.delete("origins");
    }

    nextParams.set("minPrice", String(normalizedMinPrice));
    nextParams.set("maxPrice", String(normalizedMaxPrice));
    nextParams.delete("page");

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleResetFilter = () => {
    setSelectedBrands([]);
    setSelectedOrigins([]);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);

    const nextParams = new URLSearchParams(currentSearchParams.toString());
    nextParams.delete("brandIds");
    nextParams.delete("origins");
    nextParams.delete("minPrice");
    nextParams.delete("maxPrice");
    nextParams.delete("page");

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-sm text-neutral-4 mb-5 flex items-center gap-2">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chu
        </Link>
        <FaChevronRight size={10} />
        <Link
          href={`/category/${currentCategorySlug}`}
          className="hover:text-primary-1 transition-colors"
        >
          {categoryName}
        </Link>
        {subcategoryName && (
          <>
            <FaChevronRight size={10} />
            <span className="text-neutral-1 font-semibold">{subcategoryName}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-7">
        <aside>
          <CategorySidebar
            categories={sidebarCategories}
            currentCategorySlug={currentCategorySlug}
            currentSubcategorySlug={currentSubcategorySlug}
            brandFilters={brandFilters}
            selectedBrands={selectedBrands}
            selectedOrigins={selectedOrigins}
            minPrice={minPrice}
            maxPrice={maxPrice}
            draftMinPrice={draftMinPrice}
            draftMaxPrice={draftMaxPrice}
            formatPrice={formatPrice}
            onToggleBrand={(brandId) =>
              toggleSelection(brandId, selectedBrands, setSelectedBrands)
            }
            onToggleOrigin={(origin) =>
              toggleSelection(origin, selectedOrigins, setSelectedOrigins)
            }
            onDraftMinPriceChange={setDraftMinPrice}
            onDraftMaxPriceChange={setDraftMaxPrice}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
          />
        </aside>

        <section>
          <div className="bg-neutral-10 border border-neutral-7 rounded-2xl px-5 py-4 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-neutral-1 font-semibold">
              {products.length} sản phẩm
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-5 uppercase tracking-widest">
                Sap xep
              </span>
              <select className="bg-white border border-neutral-7 text-neutral-1 rounded-xl px-3 py-2 outline-none">
                <option>Phu hop nhat</option>
                <option>Gia tang dan</option>
                <option>Gia giam dan</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-neutral-7 rounded-2xl p-12 text-center bg-white">
              <h3 className="text-xl font-semibold text-neutral-1 mb-2">
                Chưa có sản phẩm
              </h3>
              <p className="text-neutral-4">
                Danh mục này chưa có sản phẩm để hiển thị. Vui lòng quay lại sau
                hoặc chọn danh mục khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
