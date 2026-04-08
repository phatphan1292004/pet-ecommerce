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
  const page = parseNumberParam(getSearchParamValue(query.page));
  const limit = parseNumberParam(getSearchParamValue(query.limit));
  const keyword = getSearchParamValue(query.keyword);

  const products = await getFilteredProducts({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-sm text-neutral-4 mb-5 flex items-center gap-2">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chu
        </Link>
        <span>&gt;</span>
        <span>Thuong hieu</span>
        <span>&gt;</span>
        <span className="text-neutral-1 font-semibold">{selectedBrand.name}</span>
      </div>

      <div className="bg-neutral-10 border border-neutral-7 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-1">Thuong hieu {selectedBrand.name}</h1>
          <p className="text-sm text-neutral-4 mt-1">Danh sach san pham cua thuong hieu nay</p>
        </div>
        <div className="text-neutral-1 font-semibold">{normalizedProducts.length} san pham</div>
      </div>

      {normalizedProducts.length === 0 ? (
        <div className="border border-dashed border-neutral-7 rounded-2xl py-16 px-6 text-center text-neutral-4">
          <p className="text-xl font-semibold text-neutral-1 mb-2">Chua co san pham</p>
          <p>Thuong hieu nay hien chua co san pham de hien thi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {normalizedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
