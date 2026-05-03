"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks";
import {
  updateAdminProduct,
  type AdminProduct,
  type AdminUpdateProductPayload,
} from "@/features/admin/product/servers";

interface AdminProductEditFormProps {
  product: AdminProduct;
  variant?: "inline" | "page";
}

interface ProductFormValues {
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  stock: string;
  description: string;
  longDescription: string;
  specifications: string;
  benefits: string;
  images: string;
  brandId: string;
  subCategoryId: string;
  usage: string;
  ingredients: string;
  shipping: string;
  isActive: boolean;
}

const toOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  return numeric;
};

const toImageList = (value: string): string[] =>
  value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const toKeyValueRecord = (value: string): string | Record<string, string> | undefined => {
  const lines = value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return undefined;
  }

  const entries: Array<[string, string]> = [];
  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const entryValue = line.slice(separatorIndex + 1).trim();
    if (key.length === 0 || entryValue.length === 0) {
      continue;
    }

    entries.push([key, entryValue]);
  }

  if (entries.length === 0) {
    const rawText = lines.join("\n");
    return rawText.length > 0 ? rawText : undefined;
  }

  return Object.fromEntries(entries);
};

const formatKeyValueInput = (value?: string | Record<string, unknown>): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const entries = Object.entries(value)
    .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
    .filter((line) => line.trim().length > 0);

  return entries.join("\n");
};

const formatImages = (product: AdminProduct): string => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.join("\n");
  }

  if (product.image && product.image.trim().length > 0) {
    return product.image.trim();
  }

  return "";
};

const createDefaultValues = (product: AdminProduct): ProductFormValues => ({
  name: product.name || "",
  price:
    typeof product.price === "number" && Number.isFinite(product.price)
      ? String(product.price)
      : "",
  originalPrice:
    typeof product.originalPrice === "number" && Number.isFinite(product.originalPrice)
      ? String(product.originalPrice)
      : "",
  discount:
    typeof product.discount === "number" && Number.isFinite(product.discount)
      ? String(product.discount)
      : "",
  stock:
    typeof product.stock === "number" && Number.isFinite(product.stock)
      ? String(product.stock)
      : "",
  description: product.description || "",
  longDescription: product.longDescription || "",
  specifications: formatKeyValueInput(product.specifications),
  benefits: formatKeyValueInput(product.benefits),
  images: formatImages(product),
  brandId: product.brand?.id || "",
  subCategoryId: product.subCategory?.id || "",
  usage: product.usage || "",
  ingredients: product.ingredients || "",
  shipping: product.shipping || "",
  isActive: product.isActive ?? true,
});

export default function AdminProductEditForm({
  product,
  variant = "inline",
}: AdminProductEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormValues>(() =>
    createDefaultValues(product)
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();

  const handleFieldChange = (field: keyof ProductFormValues, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormValues(createDefaultValues(product));
    setFormError("");
  };

  const closeForm = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const name = formValues.name.trim();
    if (name.length === 0) {
      const message = "Vui lòng nhập tên sản phẩm";
      setFormError(message);
      showWarning(message);
      return;
    }

    const price = toOptionalNumber(formValues.price);
    if (typeof price !== "number" || price <= 0) {
      const message = "Giá bán phải lớn hơn 0";
      setFormError(message);
      showWarning(message);
      return;
    }

    const originalPrice = toOptionalNumber(formValues.originalPrice);
    const discount = toOptionalNumber(formValues.discount);
    const stock = toOptionalNumber(formValues.stock);

    if (typeof originalPrice === "number" && originalPrice < 0) {
      const message = "Giá gốc không được âm";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (typeof discount === "number" && (discount < 0 || discount > 100)) {
      const message = "Giảm giá phải trong khoảng 0-100";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (typeof stock === "number" && stock < 0) {
      const message = "Tồn kho không được âm";
      setFormError(message);
      showWarning(message);
      return;
    }

    const payload: AdminUpdateProductPayload = {
      name,
      price,
      isActive: formValues.isActive,
    };

    if (typeof originalPrice === "number") {
      payload.originalPrice = originalPrice;
    }

    if (typeof discount === "number") {
      payload.discount = discount;
    }

    if (typeof stock === "number") {
      payload.stock = stock;
    }

    const description = formValues.description.trim();
    if (description.length > 0) {
      payload.description = description;
    }

    const longDescription = formValues.longDescription.trim();
    if (longDescription.length > 0) {
      payload.longDescription = longDescription;
    }

    const specifications = toKeyValueRecord(formValues.specifications);
    if (specifications) {
      payload.specifications = specifications;
    }

    const benefits = toKeyValueRecord(formValues.benefits);
    if (benefits) {
      payload.benefits = benefits;
    }

    const usage = formValues.usage.trim();
    if (usage.length > 0) {
      payload.usage = usage;
    }

    const ingredients = formValues.ingredients.trim();
    if (ingredients.length > 0) {
      payload.ingredients = ingredients;
    }

    const shipping = formValues.shipping.trim();
    if (shipping.length > 0) {
      payload.shipping = shipping;
    }

    const images = toImageList(formValues.images);
    if (images.length > 0) {
      payload.images = images;
    }

    const brandId = formValues.brandId.trim();
    if (brandId.length > 0) {
      payload.brandId = brandId;
    }

    const subCategoryId = formValues.subCategoryId.trim();
    if (subCategoryId.length > 0) {
      payload.subCategoryId = subCategoryId;
    }

    setIsSubmitting(true);
    setFormError("");

    const result = await updateAdminProduct(product.id, payload);

    setIsSubmitting(false);

    if (!result.success) {
      const message = result.message || "Không thể cập nhật sản phẩm";
      setFormError(message);
      showError(message);
      return;
    }

    showSuccess(result.message || "Cập nhật sản phẩm thành công");
    setIsOpen(false);
    router.refresh();
  };

  const showInline = variant === "inline";
  const isFormVisible = variant === "page" || isOpen;

  return (
    <div className="space-y-3">
      {showInline ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                resetForm();
              }
              setIsOpen((prev) => !prev);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
          >
            <FiEdit2 size={15} />
            {isOpen ? "Thu gọn" : "Chỉnh sửa"}
          </button>
        </div>
      ) : null}

      {isFormVisible ? (
        <article className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-1 sm:text-base">
                Cập nhật thông tin sản phẩm
              </h3>
            </div>

            {showInline ? (
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
              >
                <FiX size={14} />
                Đóng
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Tên sản phẩm *</span>
              <input
                type="text"
                value={formValues.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                placeholder="Tên sản phẩm"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                required
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giá bán *</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formValues.price}
                onChange={(event) => handleFieldChange("price", event.target.value)}
                placeholder="VD: 150000"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                required
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giá gốc</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formValues.originalPrice}
                onChange={(event) => handleFieldChange("originalPrice", event.target.value)}
                placeholder="VD: 200000"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giảm giá (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formValues.discount}
                onChange={(event) => handleFieldChange("discount", event.target.value)}
                placeholder="VD: 10"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Tồn kho</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.stock}
                onChange={(event) => handleFieldChange("stock", event.target.value)}
                placeholder="VD: 50"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Brand ID</span>
              <input
                type="text"
                value={formValues.brandId}
                onChange={(event) => handleFieldChange("brandId", event.target.value)}
                placeholder="ID thương hiệu"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Danh mục con ID</span>
              <input
                type="text"
                value={formValues.subCategoryId}
                onChange={(event) => handleFieldChange("subCategoryId", event.target.value)}
                placeholder="ID danh mục con"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mô tả ngắn</span>
              <textarea
                value={formValues.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Mô tả ngắn"
                rows={4}
                className="min-h-[120px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mô tả chi tiết</span>
              <textarea
                value={formValues.longDescription}
                onChange={(event) => handleFieldChange("longDescription", event.target.value)}
                placeholder="Mô tả chi tiết"
                rows={8}
                className="min-h-[220px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Thông số (key: value mỗi dòng)</span>
              <textarea
                value={formValues.specifications}
                onChange={(event) => handleFieldChange("specifications", event.target.value)}
                placeholder="Product Name: ..."
                rows={6}
                className="min-h-[160px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Lợi ích (key: value mỗi dòng)</span>
              <textarea
                value={formValues.benefits}
                onChange={(event) => handleFieldChange("benefits", event.target.value)}
                placeholder="Lợi ích: ..."
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Hướng dẫn sử dụng</span>
              <textarea
                value={formValues.usage}
                onChange={(event) => handleFieldChange("usage", event.target.value)}
                placeholder="Hướng dẫn sử dụng"
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Thành phần</span>
              <textarea
                value={formValues.ingredients}
                onChange={(event) => handleFieldChange("ingredients", event.target.value)}
                placeholder="Thành phần"
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Vận chuyển</span>
              <textarea
                value={formValues.shipping}
                onChange={(event) => handleFieldChange("shipping", event.target.value)}
                placeholder="Thông tin vận chuyển"
                rows={4}
                className="min-h-[120px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Ảnh sản phẩm (mỗi dòng một URL)</span>
              <textarea
                value={formValues.images}
                onChange={(event) => handleFieldChange("images", event.target.value)}
                placeholder="https://..."
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-2 md:col-span-2">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={(event) => handleFieldChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-neutral-20 text-primary-1 focus:ring-primary-1"
              />
              Kích hoạt sản phẩm
            </label>

            {formError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:col-span-2">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 md:col-span-2 md:justify-end">
              {showInline ? (
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiX size={15} />
                  Hủy
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={15} />
                {isSubmitting ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </article>
      ) : null}
    </div>
  );
}
