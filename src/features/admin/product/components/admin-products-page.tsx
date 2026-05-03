"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiPlus, FiRotateCcw, FiSearch } from "react-icons/fi";
import AdminProductsTable from "@/features/admin/product/components/admin-products-table";
import {
  getAdminProducts,
  type AdminProduct,
  type AdminProductsMeta,
} from "@/features/admin/product/servers";

interface AdminProductsPageProps {
  initialProducts: AdminProduct[];
  initialMeta: AdminProductsMeta;
  errorMessage?: string;
}

const toOptionalNumber = (value: string): number | undefined => {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }

  const numericValue = Number(trimmedValue);
  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue;
};

export default function AdminProductsPage({
  initialProducts,
  initialMeta,
  errorMessage = "",
}: AdminProductsPageProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [meta, setMeta] = useState<AdminProductsMeta>(initialMeta);
  const [page, setPage] = useState(initialMeta.page);
  const [limit, setLimit] = useState(initialMeta.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(errorMessage);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortInput, setSortInput] = useState("");
  const [sortFilter, setSortFilter] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (
      page === initialMeta.page &&
      limit === initialMeta.limit &&
      keyword.length === 0 &&
      statusFilter === "all" &&
      sortFilter.length === 0 &&
      minPrice === undefined &&
      maxPrice === undefined
    ) {
      return;
    }

    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setFetchError("");

      const result = await getAdminProducts({
        page,
        limit,
        search: keyword || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
        sortBy: sortFilter || undefined,
        minPrice,
        maxPrice,
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setProducts([]);
        setMeta({
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
        setFetchError(result.message || "Không thể tải danh sách sản phẩm");
        setIsLoading(false);
        return;
      }

      setProducts(result.data.items);
      setMeta(result.data.meta);
      setIsLoading(false);
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    limit,
    keyword,
    statusFilter,
    sortFilter,
    minPrice,
    maxPrice,
    initialMeta.page,
    initialMeta.limit,
  ]);

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setStatusFilter(statusInput);
    setSortFilter(sortInput);
    setMinPrice(toOptionalNumber(minPriceInput));
    setMaxPrice(toOptionalNumber(maxPriceInput));
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setStatusInput("all");
    setStatusFilter("all");
    setSortInput("");
    setSortFilter("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    keyword.length > 0 ||
    statusFilter !== "all" ||
    sortFilter.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  const titleDescription = useMemo(
    () =>
      `Tổng ${meta.totalItems.toLocaleString("vi-VN")} sản phẩm - Trang ${meta.page}/${Math.max(
        meta.totalPages,
        1
      )}`,
    [meta.totalItems, meta.page, meta.totalPages]
  );

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Quản lý sản phẩm</h2>
          <p className="text-xs text-neutral-4 sm:text-sm">{titleDescription}</p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-1 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-2"
        >
          <FiPlus size={16} />
          Thêm sản phẩm
        </Link>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="grid gap-3 rounded-2xl border border-neutral-20 bg-neutral-10 p-3 md:grid-cols-[minmax(0,1fr),220px,240px,200px,auto]"
      >
        <label className="relative block">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-4"
          />
          <input
            type="text"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Tìm theo tên, slug"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={minPriceInput}
            onChange={(event) => setMinPriceInput(event.target.value)}
            placeholder="Giá từ"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
          <input
            type="text"
            value={maxPriceInput}
            onChange={(event) => setMaxPriceInput(event.target.value)}
            placeholder="Giá đến"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </div>

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm tắt</option>
        </select>

        <select
          value={sortInput}
          onChange={(event) => setSortInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="">Sắp xếp</option>
          <option value="latest">Mới nhất</option>
          <option value="price_asc">Giá tăng</option>
          <option value="price_desc">Giá giảm</option>
        </select>

        <div className="flex items-center gap-2 md:justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
          >
            <FiFilter size={15} />
            Lọc
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters && keywordInput.length === 0 && statusInput === "all"}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRotateCcw size={15} />
            Đặt lại
          </button>
        </div>
      </form>

      {hasActiveFilters ? (
        <p className="text-xs text-neutral-4">
          Đang lọc: <span className="font-semibold text-neutral-2">{keyword || "--"}</span>
          {statusFilter !== "all" ? (
            <>
              {" "}
              - Trạng thái <span className="font-semibold text-neutral-2">{statusFilter}</span>
            </>
          ) : null}
          {sortFilter.length > 0 ? (
            <>
              {" "}
              - Sắp xếp <span className="font-semibold text-neutral-2">{sortFilter}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {fetchError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {fetchError}
        </div>
      ) : null}

      <AdminProductsTable
        products={products}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(nextLimit: number) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        onProductDeleted={(deletedProductId) => {
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product.id !== deletedProductId)
          );
        }}
      />
    </section>
  );
}
