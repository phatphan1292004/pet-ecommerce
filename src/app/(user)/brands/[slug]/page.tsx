import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrands } from "@/features/guest/brand";
import ProductCard from "@/features/guest/product/components/product-card";
import { getFilteredProducts } from "@/features/guest/product/servers";
import { isItemActive, mapToProductCard, type RawProduct } from "@/utils/category";

interface BrandPageProps {
  params: Promise<{
    slug: string;
  }>;
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

const normalizeBrandToken = (value: string): string =>
  value
    .replace(/\+/g, " ")
    .trim()
    .toLowerCase();

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const brands = await getBrands();
  const normalizedSlug = normalizeBrandToken(slug);

  const selectedBrand = brands.find((brand) => {
    if (!isItemActive(brand) || !brand.name) return false;

    const slugToken = typeof brand.slug === "string" ? normalizeBrandToken(brand.slug) : "";
    const nameToken = normalizeBrandToken(brand.name);

    return slugToken === normalizedSlug || nameToken === normalizedSlug;
  });

  if (!selectedBrand) {
    notFound();
  }

  const selectedBrandId = [selectedBrand._id, selectedBrand.id]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .find((value) => value.length > 0);

  if (!selectedBrandId) {
    notFound();
  }

  const origins = parseCsvParam(getSearchParamValue(query.origins));
  const minPrice = parseNumberParam(getSearchParamValue(query.minPrice));
  const maxPrice = parseNumberParam(getSearchParamValue(query.maxPrice));
  const sortBy = getSearchParamValue(query.sortBy);
  const page = parseNumberParam(getSearchParamValue(query.page)) ?? 1;
  const limit = parseNumberParam(getSearchParamValue(query.limit)) ?? 12;
  const keyword = getSearchParamValue(query.keyword);

  const { products, pagination } = await getFilteredProducts({
    brandIds: [selectedBrandId],
    origins,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
    keyword,
  });

  const normalizedProducts = products.map((item) => mapToProductCard(item as RawProduct));

  const buildUrl = (overrides: Record<string, string | number>) => {
    const next: Record<string, string> = {
      ...(origins.length > 0 ? { origins: origins.join(",") } : {}),
      ...(minPrice !== undefined ? { minPrice: String(minPrice) } : {}),
      ...(maxPrice !== undefined ? { maxPrice: String(maxPrice) } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(keyword ? { keyword } : {}),
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, String(v)])
      ),
    };
    return `/brands/${slug}?${new URLSearchParams(next).toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-5 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-4 sm:text-sm">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chu
        </Link>
        <span>&gt;</span>
        <span>Thuong hieu</span>
        <span>&gt;</span>
        <span className="text-neutral-1 font-semibold">{selectedBrand.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-7 bg-neutral-10 px-4 py-4 sm:px-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-1 sm:text-2xl">Thuong hieu {selectedBrand.name}</h1>
          <p className="text-sm text-neutral-4 mt-1">Danh sach san pham cua thuong hieu nay</p>
        </div>
        <div className="text-neutral-1 font-semibold">{pagination.total} sản phẩm</div>
      </div>

      {normalizedProducts.length === 0 ? (
        <div className="border border-dashed border-neutral-7 rounded-2xl py-16 px-6 text-center text-neutral-4">
          <p className="text-xl font-semibold text-neutral-1 mb-2">Chua co san pham</p>
          <p>Thuong hieu nay hien chua co san pham de hien thi.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {normalizedProducts.map((product) => (
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
  );
}
