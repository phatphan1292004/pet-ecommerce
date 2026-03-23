"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { ORIGIN_FILTERS, type CategoryBrandFilterOption } from "@/utils/category";
import { type Category, type Subcategory } from "@/types/category";

interface SidebarCategory extends Omit<Category, "subcategories"> {
  subcategories: Subcategory[];
}

interface CategorySidebarProps {
  categories: SidebarCategory[];
  currentCategorySlug: string;
  currentSubcategorySlug: string;
  brandFilters: CategoryBrandFilterOption[];
  selectedBrands: string[];
  selectedOrigins: string[];
  minPrice: number;
  maxPrice: number;
  draftMinPrice: number;
  draftMaxPrice: number;
  formatPrice: (value: number) => string;
  onToggleBrand: (brandName: string) => void;
  onToggleOrigin: (origin: string) => void;
  onDraftMinPriceChange: (value: number) => void;
  onDraftMaxPriceChange: (value: number) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
}

export default function CategorySidebar({
  categories,
  currentCategorySlug,
  currentSubcategorySlug,
  brandFilters,
  selectedBrands,
  selectedOrigins,
  minPrice,
  maxPrice,
  draftMinPrice,
  draftMaxPrice,
  formatPrice,
  onToggleBrand,
  onToggleOrigin,
  onDraftMinPriceChange,
  onDraftMaxPriceChange,
  onApplyFilter,
  onResetFilter,
}: CategorySidebarProps) {
  const [openCategorySlug, setOpenCategorySlug] = useState(currentCategorySlug);

  return (
    <div className="space-y-8">
      <section className="bg-white border border-neutral-7 rounded-2xl p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-5 font-bold mb-4">
          DANH MỤC SẢN PHẨM
        </h2>

        <div className="space-y-2">
          {categories.map((item) => {
            const isOpen = openCategorySlug === item.slug;

            return (
              <div key={item._id} className="rounded-xl">
                <button
                  type="button"
                  onClick={() => setOpenCategorySlug((prev) => (prev === item.slug ? "" : item.slug))}
                  className={`w-full px-3 py-2 rounded-xl font-semibold text-sm flex items-center justify-between transition-colors ${
                    isOpen
                      ? "bg-primary-6 text-primary-1"
                      : "text-neutral-1 bg-neutral-10 hover:bg-neutral-7"
                  }`}
                >
                  <span>{item.name}</span>
                  {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </button>

                {isOpen && (
                  <div className="pl-3 pt-2 space-y-1">
                    {item.subcategories.map((sub) => {
                      const isSelected =
                        item.slug === currentCategorySlug && sub.slug === currentSubcategorySlug;

                      return (
                        <Link
                          key={sub._id}
                          href={`/category/${item.slug}/${sub.slug}`}
                          className={`block rounded-lg px-2 py-1.5 text-sm transition-colors ${
                            isSelected
                              ? "text-primary-1 font-semibold"
                              : "text-neutral-4 hover:text-primary-1"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white border border-neutral-7 rounded-2xl p-5">
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-5 font-bold mb-4">
          Thương hiệu
        </h3>
        <div className="space-y-2.5">
          {brandFilters.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 text-sm text-neutral-1">
              <input
                type="checkbox"
                className="accent-primary-1"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => onToggleBrand(brand.name)}
              />
              {brand.name}
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-neutral-7 rounded-2xl p-5">
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-5 font-bold mb-4">
          Xuất xứ
        </h3>
        <div className="space-y-2.5">
          {ORIGIN_FILTERS.map((origin) => (
            <label key={origin} className="flex items-center gap-2 text-sm text-neutral-1">
              <input
                type="checkbox"
                className="accent-primary-1"
                checked={selectedOrigins.includes(origin)}
                onChange={() => onToggleOrigin(origin)}
              />
              {origin}
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-neutral-7 rounded-2xl p-5">
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-5 font-bold mb-4">
          Khoảng giá
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-neutral-4">
              <span>Từ</span>
              <span className="text-neutral-1 font-semibold">{formatPrice(draftMinPrice)}</span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={draftMinPrice}
              onChange={(event) => onDraftMinPriceChange(Number(event.target.value))}
              className="w-full accent-primary-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-neutral-4">
              <span>Đến</span>
              <span className="text-neutral-1 font-semibold">{formatPrice(draftMaxPrice)}</span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={draftMaxPrice}
              onChange={(event) => onDraftMaxPriceChange(Number(event.target.value))}
              className="w-full accent-primary-1"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApplyFilter}
          className="flex-1 rounded-lg bg-primary-1 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Lọc
        </button>
        <button
          type="button"
          onClick={onResetFilter}
          className="flex-1 rounded-lg border border-neutral-7 bg-white px-3 py-2 text-sm font-semibold text-neutral-1 hover:bg-neutral-10 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
