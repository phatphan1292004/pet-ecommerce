"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
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
  initialSelectedProductType?: string;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5_000_000;

const normalizeBrandToken = (value: string): string =>
  value.replace(/\+/g, " ").trim().toLowerCase();

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
  initialSelectedProductType,
  products,
  pagination,
}: CategoryProductsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const minPrice = DEFAULT_MIN_PRICE;
  const maxPrice = DEFAULT_MAX_PRICE;

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialSelectedBrandIds,
  );
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(
    initialSelectedOrigins,
  );
  const [draftMinPrice, setDraftMinPrice] = useState(
    initialMinPrice ?? minPrice,
  );
  const [draftMaxPrice, setDraftMaxPrice] = useState(
    initialMaxPrice ?? maxPrice,
  );
  const [selectedProductType, setSelectedProductType] = useState<string>(
    initialSelectedProductType ?? "",
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const buildUrl = (overrides: Record<string, string | number>) => {
    const nextParams = new URLSearchParams(currentSearchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      nextParams.set(k, String(v));
    });
    return `${pathname}?${nextParams.toString()}`;
  };

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
    const normalizedSelectedBrandIds = [
      ...new Set(
        selectedBrands
          .map((token) => {
            const trimmedToken = token.trim();

            if (OBJECT_ID_REGEX.test(trimmedToken)) {
              return trimmedToken;
            }

            return brandTokenToId.get(normalizeBrandToken(trimmedToken));
          })
          .filter((value): value is string => Boolean(value)),
      ),
    ];

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

    if (selectedProductType) {
      nextParams.set("productType", selectedProductType);
    } else {
      nextParams.delete("productType");
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
    setSelectedProductType("");
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);

    const nextParams = new URLSearchParams(currentSearchParams.toString());
    nextParams.delete("brandIds");
    nextParams.delete("origins");
    nextParams.delete("minPrice");
    nextParams.delete("maxPrice");
    nextParams.delete("productType");
    nextParams.delete("page");

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="container mx-auto px-4 py-5 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-4 sm:text-sm">
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
            <span className="text-neutral-1 font-semibold">
              {subcategoryName}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:gap-7">
        <aside className="hidden lg:block">
          <CategorySidebar
            categories={sidebarCategories}
            currentCategorySlug={currentCategorySlug}
            currentSubcategorySlug={currentSubcategorySlug}
            brandFilters={brandFilters}
            selectedBrands={selectedBrands}
            selectedOrigins={selectedOrigins}
            selectedProductType={selectedProductType}
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
            onSelectProductType={setSelectedProductType}
            onDraftMinPriceChange={setDraftMinPrice}
            onDraftMaxPriceChange={setDraftMaxPrice}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
          />
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-7 bg-neutral-10 px-4 py-4 sm:px-5">
            <div className="font-semibold text-neutral-1">
              {pagination.total} sản phẩm
            </div>
            <div className="flex items-center justify-between w-full text-sm">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-neutral-2 lg:hidden"
              >
                Bộ lọc
              </button>

              <div>
                <span className="text-neutral-5 text-sm uppercase tracking-widest">
                  Sắp xếp
                </span>
                <select className="rounded-xl border border-neutral-7 bg-white px-3 py-2 text-neutral-1 outline-none">
                  <option>Phù hợp nhất</option>
                  <option>Giá tăng dần</option>
                  <option>Giá giảm dần</option>
                </select>
              </div>
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
              {/* Prev */}
              {pagination.page > 1 ? (
                <Link
                  href={buildUrl({ page: pagination.page - 1 })}
                  className="rounded-lg border border-neutral-20 px-4 py-2 text-sm text-neutral-3 transition-colors hover:border-primary-3 hover:text-primary-1"
                >
                  ← Trước
                </Link>
              ) : (
                <span className="rounded-lg border border-neutral-10 px-4 py-2 text-sm text-neutral-5 opacity-50 cursor-not-allowed">
                  ← Trước
                </span>
              )}

              {/* Page numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.page) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-neutral-5">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl({ page: p })}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? "border-primary-3 bg-primary-1 text-white"
                          : "border-neutral-20 text-neutral-3 hover:border-primary-3 hover:text-primary-1"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

              {/* Next */}
              {pagination.page < pagination.totalPages ? (
                <Link
                  href={buildUrl({ page: pagination.page + 1 })}
                  className="rounded-lg border border-neutral-20 px-4 py-2 text-sm text-neutral-3 transition-colors hover:border-primary-3 hover:text-primary-1"
                >
                  Tiếp →
                </Link>
              ) : (
                <span className="rounded-lg border border-neutral-10 px-4 py-2 text-sm text-neutral-5 opacity-50 cursor-not-allowed">
                  Tiếp →
                </span>
              )}
            </div>
          )}
        </section>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-black/45"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Đóng bộ lọc"
          />

          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
                Bộ lọc
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-md border border-neutral-20 p-1.5 text-neutral-3"
                aria-label="Đóng"
              >
                <IoCloseOutline size={18} />
              </button>
            </div>

            <CategorySidebar
              categories={sidebarCategories}
              currentCategorySlug={currentCategorySlug}
              currentSubcategorySlug={currentSubcategorySlug}
              brandFilters={brandFilters}
              selectedBrands={selectedBrands}
              selectedOrigins={selectedOrigins}
              selectedProductType={selectedProductType}
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
              onSelectProductType={setSelectedProductType}
              onDraftMinPriceChange={setDraftMinPrice}
              onDraftMaxPriceChange={setDraftMaxPrice}
              onApplyFilter={() => {
                handleApplyFilter();
                setMobileFiltersOpen(false);
              }}
              onResetFilter={() => {
                handleResetFilter();
                setMobileFiltersOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
