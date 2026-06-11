"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSave, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks";
import {
  createAdminProduct,
  type AdminCreateProductPayload,
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

interface ProductFormValues {
  name: string;
  slug: string;
  price: string;
  originalPrice: string;
  discount: string;
  stock: string;
  description: string;
  longDescription: string;
  specifications: string;
  benefits: string;
  usage: string;
  ingredients: string;
  shipping: string;
  brandId: string;
  subCategoryId: string;
  isActive: boolean;
}

const createDefaultValues = (): ProductFormValues => ({
  name: "",
  slug: "",
  price: "",
  originalPrice: "",
  discount: "",
  stock: "",
  description: "",
  longDescription: "",
  specifications: "",
  benefits: "",
  usage: "",
  ingredients: "",
  shipping: "",
  brandId: "",
  subCategoryId: "",
  isActive: true,
});

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

const toRequiredInteger = (value: string): number | undefined => {
  const numeric = toOptionalNumber(value);
  if (typeof numeric !== "number" || numeric < 0) {
    return undefined;
  }

  return Math.floor(numeric);
};

const toSlug = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();
};

const toRequiredKeyValueRecord = (value: string): Record<string, string> | undefined => {
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
    return undefined;
  }

  return Object.fromEntries(entries);
};

export default function AdminProductCreateForm() {
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: createDefaultValues(),
  });

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
    if (imageFiles.length === 0) {
      setImagePreviews([]);
      return;
    }

    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imageFiles]);

  const resetForm = () => {
    reset(createDefaultValues());
    setFormError("");
    setSlugTouched(false);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (isSubmitting) {
      return;
    }

    const price = toOptionalNumber(data.price);
    const originalPrice = toOptionalNumber(data.originalPrice);
    const discount = toOptionalNumber(data.discount);
    const stock = toRequiredInteger(data.stock);
    const specifications = toRequiredKeyValueRecord(data.specifications);
    const benefits = toRequiredKeyValueRecord(data.benefits);

    if (imageFiles.length === 0) {
      const message = "Vui lòng chọn ít nhất 1 ảnh sản phẩm";
      setFormError(message);
      showWarning(message);
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    let imageUrls: string[] = [];

    try {
      imageUrls = await Promise.all(
        imageFiles.map(async (file) => uploadProductImageToCloudinary(file))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải ảnh lên";
      setFormError(message);
      showError(message);
      setIsSubmitting(false);
      return;
    }

    const payload: AdminCreateProductPayload = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      price: price!,
      brandId: data.brandId.trim(),
      subCategoryId: data.subCategoryId.trim(),
      description: data.description.trim(),
      longDescription: data.longDescription.trim(),
      specifications: specifications!,
      benefits: benefits!,
      usage: data.usage.trim(),
      ingredients: data.ingredients.trim(),
      stock: stock!,
      shipping: data.shipping.trim(),
      images: imageUrls,
      isActive: data.isActive,
    };

    if (typeof originalPrice === "number") {
      payload.originalPrice = originalPrice;
    }

    if (typeof discount === "number") {
      payload.discount = discount;
    }

    const result = await createAdminProduct(payload);

    setIsSubmitting(false);

    if (!result.success) {
      const message = result.message || "Không thể tạo sản phẩm";
      setFormError(message);
      showError(message);
      return;
    }

    showSuccess(result.message || "Tạo sản phẩm thành công");
    resetForm();

    if (result.data?.id) {
      router.push(`/admin/products/${result.data.id}`);
      return;
    }

    router.push("/admin/products");
  };

  return (
    <article className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
          <span className="text-xs font-medium text-neutral-4">Tên sản phẩm *</span>
          <input
            type="text"
            {...register("name", {
              required: "Vui lòng nhập tên sản phẩm",
              onChange: (e) => {
                const value = e.target.value;
                if (!slugTouched) {
                  setValue("slug", toSlug(value), { shouldValidate: true });
                }
              }
            })}
            placeholder="Tên sản phẩm"
            className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
          />
          {errors.name && (
            <span className="text-xs text-red-600 block mt-1">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-neutral-2">
          <span className="text-xs font-medium text-neutral-4">Slug *</span>
          <input
            type="text"
            {...register("slug", {
              required: "Vui lòng nhập slug sản phẩm",
              onChange: () => {
                setSlugTouched(true);
              }
            })}
            placeholder="men-bo-sung-vi-sinh..."
            className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
          />
          {errors.slug && (
            <span className="text-xs text-red-600 block mt-1">{errors.slug.message}</span>
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
          <span className="text-xs font-medium text-neutral-4">Tồn kho *</span>
          <input
            type="number"
            min="0"
            step="1"
            {...register("stock", {
              required: "Tồn kho phải là số không âm",
              validate: {
                nonNegativeInt: (val) => {
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
          <span className="text-xs font-medium text-neutral-4">Thương hiệu *</span>
          <select
            {...register("brandId", {
              required: "Vui lòng chọn thương hiệu",
            })}
            className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
            disabled={isLoadingOptions}
          >
            <option value="">Chọn thương hiệu</option>
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
          <span className="text-xs font-medium text-neutral-4">Danh mục con *</span>
          <select
            {...register("subCategoryId", {
              required: "Vui lòng chọn danh mục con",
            })}
            className="h-12 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
            disabled={isLoadingOptions}
          >
            <option value="">Chọn danh mục con</option>
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
          <span className="text-xs font-medium text-neutral-4">Mô tả ngắn *</span>
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
          <span className="text-xs font-medium text-neutral-4">Mô tả chi tiết *</span>
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
          <span className="text-xs font-medium text-neutral-4">Thông số (key: value mỗi dòng) *</span>
          <textarea
            {...register("specifications", {
              required: "Thông số phải theo định dạng key: value",
              validate: {
                keyValue: (val) => {
                  if (!toRequiredKeyValueRecord(val)) {
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
          <span className="text-xs font-medium text-neutral-4">Lợi ích (key: value mỗi dòng) *</span>
          <textarea
            {...register("benefits", {
              required: "Lợi ích phải theo định dạng key: value",
              validate: {
                keyValue: (val) => {
                  if (!toRequiredKeyValueRecord(val)) {
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
          <span className="text-xs font-medium text-neutral-4">Hướng dẫn sử dụng *</span>
          <textarea
            {...register("usage", {
              required: "Vui lòng nhập hướng dẫn sử dụng",
            })}
            placeholder="Hướng dẫn sử dụng"
            rows={5}
            className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
          />
          {errors.usage && (
            <span className="text-xs text-red-600 block mt-1">{errors.usage.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
          <span className="text-xs font-medium text-neutral-4">Thành phần *</span>
          <textarea
            {...register("ingredients", {
              required: "Vui lòng nhập thành phần",
            })}
            placeholder="Thành phần"
            rows={5}
            className="min-h-[140px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
          />
          {errors.ingredients && (
            <span className="text-xs text-red-600 block mt-1">{errors.ingredients.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
          <span className="text-xs font-medium text-neutral-4">Vận chuyển *</span>
          <textarea
            {...register("shipping", {
              required: "Vui lòng nhập thông tin vận chuyển",
            })}
            placeholder="Thông tin vận chuyển"
            rows={4}
            className="min-h-[120px] w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base outline-none focus:border-primary-1"
          />
          {errors.shipping && (
            <span className="text-xs text-red-600 block mt-1">{errors.shipping.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
          <span className="text-xs font-medium text-neutral-4">Ảnh sản phẩm *</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
            className="block w-full text-sm text-neutral-2 file:mr-3 file:rounded-lg file:border file:border-neutral-20 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-4"
            required
          />
          {imagePreviews.length > 0 ? (
            <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-neutral-20 bg-white"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={420}
                    height={260}
                    className="h-44 w-full object-cover sm:h-52"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-black/60 text-sm font-semibold text-white shadow transition hover:bg-black/80"
                    aria-label="Xoa anh"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </label>

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
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave size={15} />
            {isSubmitting ? "Đang lưu..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </article>
  );
}
