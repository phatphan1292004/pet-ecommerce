import { Metadata } from "next";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import ProductCard, {
  Product,
} from "@/features/guest/product/components/product-card";
import { getServerVariables } from "@/server_variables/sync";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q ?? "";
  return {
    title: q ? `Kết quả tìm kiếm cho "${q}" – Pet Spots` : "Tìm kiếm – Pet Spots",
    description: `Tìm kiếm sản phẩm thú cưng${q ? ` cho "${q}"` : ""} tại Pet Spots.`,
  };
}

interface SearchResult {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const SORT_OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "priceAsc", label: "Giá tăng dần" },
  { value: "priceDesc", label: "Giá giảm dần" },
  { value: "newest", label: "Mới nhất" },
];

async function searchProducts(
  q: string,
  page: number,
  limit: number,
  sortBy?: string
): Promise<SearchResult | null> {
  const apiBase =
    getServerVariables("PET_ECOMMERCE_API") || "http://localhost:9000";

  const params = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
  });
  if (sortBy) params.set("sortBy", sortBy);

  try {
    const res = await fetch(`${apiBase}/products/search?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SearchResult;
  } catch {
    return null;
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = Math.max(1, parseInt(params.limit ?? "12", 10) || 12);
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : "";

  const result = await searchProducts(q, page, limit, sortBy || undefined);
  const products: Product[] = result?.data ?? [];
  const pagination = result?.pagination ?? {
    total: 0,
    page,
    limit,
    totalPages: 0,
  };

  const buildUrl = (overrides: Record<string, string | number>) => {
    const next: Record<string, string> = {
      q,
      page: String(page),
      limit: String(limit),
      ...(sortBy ? { sortBy } : {}),
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, String(v)])
      ),
    };
    return `/search?${new URLSearchParams(next).toString()}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-20 bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-1 sm:text-2xl">
                {q ? (
                  <>
                    Kết quả cho{" "}
                    <span className="text-primary-1">&ldquo;{q}&rdquo;</span>
                  </>
                ) : (
                  "Tìm kiếm sản phẩm"
                )}
              </h1>
              {q && (
                <p className="mt-1 text-sm text-neutral-5">
                  Tìm thấy{" "}
                  <span className="font-semibold text-neutral-2">
                    {pagination.total}
                  </span>{" "}
                  sản phẩm
                </p>
              )}
            </div>

            {/* Sort dropdown */}
            {products.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-5">Sắp xếp:</span>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ sortBy: opt.value, page: 1 })}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        sortBy === opt.value
                          ? "border-primary-3 bg-primary-6 font-medium text-primary-1"
                          : "border-neutral-20 text-neutral-3 hover:border-primary-5 hover:text-primary-1"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!q ? (
          /* No query */
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-10">
              <IoSearchOutline size={36} className="text-neutral-5" />
            </div>
            <p className="text-lg font-medium text-neutral-3">
              Nhập tên sản phẩm để bắt đầu tìm kiếm
            </p>
          </div>
        ) : products.length === 0 ? (
          /* No results */
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-10">
              <IoSearchOutline size={36} className="text-neutral-5" />
            </div>
            <p className="text-lg font-medium text-neutral-3">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="text-sm text-neutral-5">
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
            </p>
            <Link
              href="/"
              className="mt-2 rounded-lg bg-primary-1 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-2"
            >
              Về trang chủ
            </Link>
          </div>
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                {/* Prev */}
                {page > 1 ? (
                  <Link
                    href={buildUrl({ page: page - 1 })}
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
                      Math.abs(p - page) <= 1
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
                          p === page
                            ? "border-primary-3 bg-primary-1 text-white"
                            : "border-neutral-20 text-neutral-3 hover:border-primary-3 hover:text-primary-1"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}

                {/* Next */}
                {page < pagination.totalPages ? (
                  <Link
                    href={buildUrl({ page: page + 1 })}
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
          </>
        )}
      </div>
    </div>
  );
}
