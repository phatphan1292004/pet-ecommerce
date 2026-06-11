"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks";
import {
  updateAdminProduct,
  type AdminProduct,
  type AdminUpdateProductPayload,
} from "@/features/admin/product/servers";
import { getBrands } from "@/features/guest/brand/servers";
import { getCategories, getSubCategories } from "@/features/guest/category/servers/category";
import { uploadProductImageToCloudinary } from "@/integrations/cloudinary";

interface BrandOption {
  id: string;
  name: string;
}

interface SubCategoryOption {
  id: string;
  name: string;
  categoryName: string;
}

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
  console.log("product for edit form", product);
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: createDefaultValues(product),
  });

  const formBrandId = watch("brandId");
  const formSubCategoryId = watch("subCategoryId");

  const [existingImages, setExistingImages] = useState<string[]>(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return [...product.images];
    }
    if (product.image && product.image.trim().length > 0) {
      return [product.image.trim()];
    }
    return [];
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();

  const brandName = product.brand?.name ?? "";
  const subCategoryName = product.subCategory?.name ?? "";

  const hasBrandOption = brands.some((brand) => brand.id === formBrandId);
  const hasSubCategoryOption = subCategories.some(
    (subCategory) => subCategory.id === formSubCategoryId
  );

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const [brandItems, categories] = await Promise.all([getBrands(), getCategories()]);
        if (!isActive) {
          return;
        }

        const normalizedBrands = brandItems
          .map((brand) => ({
            id: (brand._id || brand.id || "").trim(),
            name: brand.name,
          }))
          .filter((brand) => brand.id.length > 0 && brand.name.length > 0);
        setBrands(normalizedBrands);

        if (Array.isArray(categories) && categories.length > 0) {
          const subCategoryGroups = await Promise.all(
            categories.map(async (category) => {
              const items = await getSubCategories(category._id);
              return (items ?? []).map((subCategory) => ({
                id: subCategory._id,
                name: subCategory.name,
                categoryName: category.name,
              }));
            })
          );

          if (!isActive) {
            return;
          }

          const flattened = subCategoryGroups.flat();
          flattened.sort((left, right) => {
            const categoryCompare = left.categoryName.localeCompare(right.categoryName, "vi");
            if (categoryCompare !== 0) {
              return categoryCompare;
            }
            return left.name.localeCompare(right.name, "vi");
          });

          setSubCategories(flattened);
        } else {
          setSubCategories([]);
        }
      } catch {
        if (isActive) {
          setBrands([]);
          setSubCategories([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    reset(createDefaultValues(product));
    setExistingImages(
      Array.isArray(product.images) && product.images.length > 0
        ? [...product.images]
        : product.image && product.image.trim().length > 0
          ? [product.image.trim()]
          : []
    );
    setNewImageFiles([]);
    setNewImagePreviews([]);
  }, [product, reset]);

  useEffect(() => {
    if (newImageFiles.length === 0) {
      setNewImagePreviews([]);
      return;
    }

    const previews = newImageFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newImageFiles]);

  useEffect(() => {
    if (!brandName || formBrandId || brands.length === 0) {
      return;
    }

    const matched = brands.find(
      (brand) => brand.name.toLowerCase() === brandName.toLowerCase()
    );

    if (matched) {
      setValue("brandId", matched.id, { shouldValidate: true });
    }
  }, [brandName, brands, formBrandId, setValue]);

  useEffect(() => {
    if (!subCategoryName || formSubCategoryId || subCategories.length === 0) {
      return;
    }

    const matched = subCategories.find(
      (subCategory) => subCategory.name.toLowerCase() === subCategoryName.toLowerCase()
    );

    if (matched) {
      setValue("subCategoryId", matched.id, { shouldValidate: true });
    }
  }, [subCategoryName, subCategories, formSubCategoryId, setValue]);

  const resetForm = () => {
    reset(createDefaultValues(product));
    setExistingImages(
      Array.isArray(product.images) && product.images.length > 0
        ? [...product.images]
        : product.image && product.image.trim().length > 0
          ? [product.image.trim()]
          : []
    );
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const closeForm = () => {
    setIsOpen(false);
    resetForm();
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (isSubmitting) {
      return;
    }

    const name = data.name.trim();
    const price = toOptionalNumber(data.price);
    if (typeof price !== "number" || price <= 0) {
      const message = "Giá bán phải lớn hơn 0";
      showWarning(message);
      return;
    }

    const originalPrice = toOptionalNumber(data.originalPrice);
    const discount = toOptionalNumber(data.discount);
    const stock = toOptionalNumber(data.stock);

    const payload: AdminUpdateProductPayload = {
      name,
      price,
      isActive: data.isActive,
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

    const description = data.description.trim();
    if (description.length > 0) {
      payload.description = description;
    }

    const longDescription = data.longDescription.trim();
    if (longDescription.length > 0) {
      payload.longDescription = longDescription;
    }

    const specifications = toKeyValueRecord(data.specifications);
    if (specifications) {
      payload.specifications = specifications;
    }

    const benefits = toKeyValueRecord(data.benefits);
    if (benefits) {
      payload.benefits = benefits;
    }

    const usage = data.usage.trim();
    if (usage.length > 0) {
      payload.usage = usage;
    }

    const ingredients = data.ingredients.trim();
    if (ingredients.length > 0) {
      payload.ingredients = ingredients;
    }

    const shipping = data.shipping.trim();
    if (shipping.length > 0) {
      payload.shipping = shipping;
    }

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      const message = "Vui lòng chọn ít nhất 1 ảnh sản phẩm";
      showWarning(message);
      return;
    }

    const brandId = data.brandId.trim();
    if (brandId.length > 0) {
      payload.brandId = brandId;
    }

    const subCategoryId = data.subCategoryId.trim();
    if (subCategoryId.length > 0) {
      payload.subCategoryId = subCategoryId;
    }

    setIsSubmitting(true);

    let uploadedUrls: string[] = [];
    if (newImageFiles.length > 0) {
      try {
        uploadedUrls = await Promise.all(
          newImageFiles.map(async (file) => uploadProductImageToCloudinary(file))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tải ảnh lên";
        showError(message);
        setIsSubmitting(false);
        return;
      }
    }

    payload.images = [...existingImages, ...uploadedUrls];

    const result = await updateAdminProduct(product.id, payload);

    setIsSubmitting(false);

    if (!result.success) {
      const message = result.message || "Không thể cập nhật sản phẩm";
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

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Tên sản phẩm *</span>
              <input
                type="text"
                {...register("name", {
                  required: "Vui lòng nhập tên sản phẩm",
                })}
                placeholder="Tên sản phẩm"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.name && (
                <span className="text-xs text-red-600 block mt-1">{errors.name.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giá bán *</span>
              <input
                type="number"
                min="0"
                step="1000"
                {...register("price", {
                  required: "Giá bán phải lớn hơn 0",
                  validate: {
                    positive: (val) => {
                      const num = Number(val);
                      if (Number.isNaN(num) || num <= 0) {
                        return "Giá bán phải lớn hơn 0";
                      }
                      return true;
                    }
                  },
                  onChange: () => {
                    void trigger("originalPrice");
                  }
                })}
                placeholder="VD: 150000"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.price && (
                <span className="text-xs text-red-600 block mt-1">{errors.price.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giá gốc</span>
              <input
                type="number"
                min="0"
                step="1000"
                {...register("originalPrice", {
                  validate: {
                    nonNegative: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0) {
                        return "Giá gốc không được âm";
                      }
                      return true;
                    },
                    comparison: (val) => {
                      if (!val) return true;
                      const priceVal = watch("price");
                      if (priceVal && Number(priceVal) > Number(val)) {
                        return "Giá bán không được lớn hơn giá gốc";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="VD: 200000"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.originalPrice && (
                <span className="text-xs text-red-600 block mt-1">{errors.originalPrice.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giảm giá (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                {...register("discount", {
                  validate: {
                    range: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0 || num > 100) {
                        return "Giảm giá phải trong khoảng 0-100";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="VD: 10"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.discount && (
                <span className="text-xs text-red-600 block mt-1">{errors.discount.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Tồn kho</span>
              <input
                type="number"
                min="0"
                step="1"
                {...register("stock", {
                  validate: {
                    nonNegativeInt: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
                        return "Tồn kho phải là số không âm";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="VD: 50"
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.stock && (
                <span className="text-xs text-red-600 block mt-1">{errors.stock.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Thương hiệu</span>
              <select
                {...register("brandId", {
                  required: "Vui lòng chọn thương hiệu",
                })}
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                disabled={isLoadingOptions}
              >
                <option value="">Chọn thương hiệu</option>
                {!hasBrandOption && formBrandId ? (
                  <option value={formBrandId}>
                    {product.brand?.name || "Thuong hieu hien tai"}
                  </option>
                ) : null}
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <span className="text-xs text-red-600 block mt-1">{errors.brandId.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Danh mục con</span>
              <select
                {...register("subCategoryId", {
                  required: "Vui lòng chọn danh mục con",
                })}
                className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                disabled={isLoadingOptions}
              >
                <option value="">Chọn danh mục con</option>
                {!hasSubCategoryOption && formSubCategoryId ? (
                  <option value={formSubCategoryId}>
                    {product.subCategory?.name || "Danh muc hien tai"}
                  </option>
                ) : null}
                {subCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.categoryName} - {subCategory.name}
                  </option>
                ))}
              </select>
              {errors.subCategoryId && (
                <span className="text-xs text-red-600 block mt-1">{errors.subCategoryId.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mô tả ngắn</span>
              <textarea
                {...register("description", {
                  required: "Vui lòng nhập mô tả ngắn",
                })}
                placeholder="Mô tả ngắn"
                rows={4}
                className="min-h-[120px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
              {errors.description && (
                <span className="text-xs text-red-600 block mt-1">{errors.description.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mô tả chi tiết</span>
              <textarea
                {...register("longDescription", {
                  required: "Vui lòng nhập mô tả chi tiết",
                })}
                placeholder="Mô tả chi tiết"
                rows={8}
                className="min-h-[220px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
              {errors.longDescription && (
                <span className="text-xs text-red-600 block mt-1">{errors.longDescription.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Thông số (key: value mỗi dòng)</span>
              <textarea
                {...register("specifications", {
                  validate: {
                    keyValue: (val) => {
                      if (!val) return true;
                      if (!toKeyValueRecord(val)) {
                        return "Thông số phải theo định dạng key: value";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="Product Name: ..."
                rows={6}
                className="min-h-[160px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
              {errors.specifications && (
                <span className="text-xs text-red-600 block mt-1">{errors.specifications.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Lợi ích (key: value mỗi dòng)</span>
              <textarea
                {...register("benefits", {
                  validate: {
                    keyValue: (val) => {
                      if (!val) return true;
                      if (!toKeyValueRecord(val)) {
                        return "Lợi ích phải theo định dạng key: value";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="Lợi ích: ..."
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
              {errors.benefits && (
                <span className="text-xs text-red-600 block mt-1">{errors.benefits.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Hướng dẫn sử dụng</span>
              <textarea
                {...register("usage")}
                placeholder="Hướng dẫn sử dụng"
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Thành phần</span>
              <textarea
                {...register("ingredients")}
                placeholder="Thành phần"
                rows={5}
                className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Vận chuyển</span>
              <textarea
                {...register("shipping")}
                placeholder="Thông tin vận chuyển"
                rows={4}
                className="min-h-[120px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
              />
            </label>

            <div className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Ảnh sản phẩm *</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setNewImageFiles((prev) => [...prev, ...files]);
                }}
                className="block w-full text-sm text-neutral-2 file:mr-3 file:rounded-lg file:border file:border-neutral-20 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-4"
              />

              {(existingImages.length > 0 || newImagePreviews.length > 0) ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Existing images previews */}
                  {existingImages.map((imageUrl, index) => (
                    <div
                      key={`existing-${imageUrl}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-neutral-20 bg-white"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Existing image ${index + 1}`}
                        width={420}
                        height={260}
                        className="h-44 w-full object-cover sm:h-52"
                        unoptimized
                      />
                      <span className="absolute left-2 top-2 rounded bg-primary-1/90 px-2 py-0.5 text-2xs font-semibold text-white shadow">
                        Ảnh hiện tại
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-black/60 text-sm font-semibold text-white shadow transition hover:bg-black/80"
                        aria-label="Xóa ảnh hiện tại"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {/* New images previews */}
                  {newImagePreviews.map((previewUrl, index) => (
                    <div
                      key={`new-${previewUrl}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-neutral-20 bg-white"
                    >
                      <Image
                        src={previewUrl}
                        alt={`New image preview ${index + 1}`}
                        width={420}
                        height={260}
                        className="h-44 w-full object-cover sm:h-52"
                        unoptimized
                      />
                      <span className="absolute left-2 top-2 rounded bg-emerald-600/90 px-2 py-0.5 text-2xs font-semibold text-white shadow">
                        Ảnh mới chọn
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-black/60 text-sm font-semibold text-white shadow transition hover:bg-black/80"
                        aria-label="Xóa ảnh mới chọn"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-2 md:col-span-2">
              <input
                type="checkbox"
                {...register("isActive")}
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
