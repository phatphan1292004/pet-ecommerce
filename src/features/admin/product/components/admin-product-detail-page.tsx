import Link from "next/link";
import type { AdminProduct } from "@/features/admin/product/servers";
import AdminProductImageSlider from "./admin-product-image-slider";

interface AdminProductDetailPageProps {
  product: AdminProduct;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const getProductImage = (product: AdminProduct) => {
  if (product.image && product.image.trim().length > 0) {
    return product.image;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0] || "/logo.png";
  }

  return "/logo.png";
};

const getProductImages = (product: AdminProduct) => {
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image) => typeof image === "string" && image.trim().length > 0,
      )
    : [];

  if (images.length > 0) {
    return images;
  }

  const fallback = getProductImage(product);
  return fallback ? [fallback] : [];
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const formatKeyLabel = (value: string) => {
  const withSpaces = value.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const renderTextContent = (value?: unknown) => {
  if (value === undefined || value === null || value === "") {
    return <p className="text-base text-neutral-4">--</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-base text-neutral-4">--</p>;
    }

    return (
      <ul className="list-disc space-y-1 pl-5 text-base text-neutral-2">
        {value.map((item, index) => (
          <li key={`${String(item)}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([, entryValue]) =>
      entryValue !== undefined && entryValue !== null && entryValue !== ""
    );

    if (entries.length === 0) {
      return <p className="text-base text-neutral-4">--</p>;
    }

    return (
      <div className="space-y-2">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-medium text-neutral-4">
              {formatKeyLabel(key)}:
            </span>
            <span className="text-base text-neutral-2">
              {String(entryValue)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-base text-neutral-2 whitespace-pre-line">
      {String(value)}
    </p>
  );
};

const getStatusLabel = (product: AdminProduct) => {
  if (product.isActive === true) {
    return "Đang hoạt động";
  }

  if (product.isActive === false) {
    return "Tạm tắt";
  }

  return product.status || "Chưa rõ";
};

export default function AdminProductDetailPage({
  product,
}: AdminProductDetailPageProps) {
  const images = getProductImages(product);
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-xs font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 sm:text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>

      <section className="space-y-4">
        <div className="grid items-start gap-4 md:grid-cols-[320px,minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
            <AdminProductImageSlider images={images} name={product.name} />
            <div className="mt-4 space-y-1">
              <p className="text-sm uppercase text-neutral-4">ID</p>
              <p className="text-base font-semibold text-neutral-2">
                {product.id}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-1 sm:text-lg">
              {product.name || "Sản phẩm"}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-4">Giá bán</p>
                <p className="text-base font-semibold text-neutral-2">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-4">Giá gốc</p>
                <p className="text-base text-neutral-2">
                  {formatCurrency(product.originalPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-4">Giảm giá</p>
                <p className="text-base text-neutral-2">
                  {typeof product.discount === "number" && Number.isFinite(product.discount)
                    ? `${product.discount}%`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-4">Tồn kho</p>
                <p className="text-base text-neutral-2">
                  {typeof product.stock === "number" ? product.stock : "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-4">Trạng thái</p>
                <p className="text-base text-neutral-2">
                  {getStatusLabel(product)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-1">
            Thông tin danh mục
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-base text-neutral-4">Thương hiệu</p>
              <p className="text-base text-neutral-2">
                {product.brand?.name || product.brand?.id || "--"}
              </p>
            </div>
            <div>
              <p className="text-base text-neutral-4">Danh mục</p>
              <p className="text-base text-neutral-2">
                {product.category?.name || product.category?.id || "--"}
              </p>
            </div>
            <div>
              <p className="text-base text-neutral-4">Danh mục con</p>
              <p className="text-base text-neutral-2">
                {product.subCategory?.name || product.subCategory?.id || "--"}
              </p>
            </div>
            <div>
              <p className="text-base text-neutral-4">Tạo lúc</p>
              <p className="text-base text-neutral-2">
                {formatDateTime(product.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-1">
            Nội dung chi tiết
          </h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <p className="text-base text-neutral-4">Mô tả ngắn</p>
                {renderTextContent(product.description)}
              </div>
              <div className="lg:col-span-2">
                <p className="text-base text-neutral-4">Mô tả chi tiết</p>
                {renderTextContent(product.longDescription)}
              </div>
              <div className="rounded-xl border border-neutral-20 bg-white p-3">
                <p className="text-base font-semibold text-neutral-1">Thông số</p>
                <div className="mt-2">{renderTextContent(product.specifications)}</div>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-white p-3">
                <p className="text-base font-semibold text-neutral-1">Lợi ích</p>
                <div className="mt-2">{renderTextContent(product.benefits)}</div>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-white p-3">
                <p className="text-base font-semibold text-neutral-1">Hướng dẫn sử dụng</p>
                <div className="mt-2">{renderTextContent(product.usage)}</div>
              </div>
              <div className="rounded-xl border border-neutral-20 bg-white p-3">
                <p className="text-base font-semibold text-neutral-1">Thành phần</p>
                <div className="mt-2">{renderTextContent(product.ingredients)}</div>
              </div>
              <div>
                <p className="text-base text-neutral-4">Vận chuyển</p>
                {renderTextContent(product.shipping)}
              </div>
              <div>
                <p className="text-base text-neutral-4">Đánh giá</p>
                {renderTextContent(product.review)}
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
