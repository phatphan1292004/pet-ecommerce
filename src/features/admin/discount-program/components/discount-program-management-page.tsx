"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiDownload,
  FiFilter,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useToast } from "@/hooks";
import AdminDiscountProgramsTable from "@/features/admin/discount-program/components/admin-discount-programs-table";
import {
  createAdminDiscountProgram,
  getAdminDiscountPrograms,
  updateAdminDiscountProgram,
  type AdminDiscountProgram,
  type AdminDiscountProgramsMeta,
  type AdminCreateDiscountProgramPayload,
  type AdminUpdateDiscountProgramPayload,
} from "@/features/admin/discount-program/servers";
import { getAdminProducts, type AdminProduct } from "@/features/admin/product/servers";

interface DiscountProgramManagementPageProps {
  initialPrograms: AdminDiscountProgram[];
  initialMeta: AdminDiscountProgramsMeta;
  errorMessage?: string;
}

interface DiscountProgramFormValues {
  name: string;
  code: string;
  discountType: string;
  discountValue: string;
  startDate: string;
  endDate: string;
  description: string;
  productIds: string[];
  isActive: boolean;
}

const createDefaultFormValues = (): DiscountProgramFormValues => ({
  name: "",
  code: "",
  discountType: "",
  discountValue: "",
  startDate: "",
  endDate: "",
  description: "",
  productIds: [],
  isActive: true,
});

const toDatetimeLocalInput = (value?: string): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - timezoneOffset);

  return localTime.toISOString().slice(0, 16);
};

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

const toOptionalIsoDatetime = (value: string): string | undefined => {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }

  const date = new Date(trimmedValue);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

export default function DiscountProgramManagementPage({
  initialPrograms,
  initialMeta,
  errorMessage = "",
}: DiscountProgramManagementPageProps) {
  const [programs, setPrograms] = useState<AdminDiscountProgram[]>(initialPrograms);
  const [meta, setMeta] = useState<AdminDiscountProgramsMeta>(initialMeta);
  const [page, setPage] = useState(initialMeta.page);
  const [limit, setLimit] = useState(initialMeta.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(errorMessage);
  const [reloadToken, setReloadToken] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const productSelectRef = useRef<HTMLDivElement | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AdminDiscountProgram | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showError, showSuccess, showWarning } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DiscountProgramFormValues>({
    defaultValues: createDefaultFormValues(),
  });

  useEffect(() => {
    register("productIds", {
      required: "Vui lòng chọn ít nhất 1 sản phẩm",
      validate: {
        hasProducts: (value) => {
          if (!value || value.length === 0) {
            return "Vui lòng chọn ít nhất 1 sản phẩm";
          }
          return true;
        }
      }
    });
  }, [register]);

  useEffect(() => {
    if (
      reloadToken === 0 &&
      page === initialMeta.page &&
      limit === initialMeta.limit &&
      searchFilter.length === 0 &&
      typeFilter.length === 0 &&
      statusFilter === "all"
    ) {
      return;
    }

    let isMounted = true;

    const loadPrograms = async () => {
      setIsLoading(true);
      setFetchError("");

      const result = await getAdminDiscountPrograms({
        page,
        limit,
        search: searchFilter || undefined,
        discountType: typeFilter || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setPrograms([]);
        setMeta({
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
        setFetchError(result.message || "Không thể tải chương trình giảm giá");
        setIsLoading(false);
        return;
      }

      setPrograms(result.data.items);
      setMeta(result.data.meta);
      setIsLoading(false);
    };

    void loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    limit,
    searchFilter,
    typeFilter,
    statusFilter,
    reloadToken,
    initialMeta.page,
    initialMeta.limit,
  ]);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    let isMounted = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      const result = await getAdminProducts({ page: 1, limit: 200 });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setProducts(result.data.items);
      setIsLoadingProducts(false);
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (!isProductSelectOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        productSelectRef.current &&
        !productSelectRef.current.contains(event.target as Node)
      ) {
        setIsProductSelectOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProductSelectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProductSelectOpen]);

  const hasActiveFilters =
    searchFilter.length > 0 || typeFilter.length > 0 || statusFilter !== "all";

  const titleDescription = useMemo(
    () =>
      `Tổng ${meta.totalItems.toLocaleString("vi-VN")} chương trình · Trang ${meta.page}/${Math.max(
        meta.totalPages,
        1
      )}`,
    [meta.totalItems, meta.page, meta.totalPages]
  );

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchFilter(searchInput.trim());
    setTypeFilter(typeInput.trim());
    setStatusFilter(statusInput);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchFilter("");
    setTypeInput("");
    setTypeFilter("");
    setStatusInput("all");
    setStatusFilter("all");
    setPage(1);
  };

  const resetForm = () => {
    reset(createDefaultFormValues());
    setFormError("");
    setEditingProgram(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (program: AdminDiscountProgram) => {
    setEditingProgram(program);
    setFormError("");
    reset({
      name: program.name || "",
      code: program.code || "",
      discountType: program.discountType || "",
      discountValue:
        typeof program.discountValue === "number" && Number.isFinite(program.discountValue)
          ? String(program.discountValue)
          : "",
      startDate: toDatetimeLocalInput(program.startDate),
      endDate: toDatetimeLocalInput(program.endDate),
      description: program.description || "",
      productIds: program.productIds ?? [],
      isActive: program.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIsProductSelectOpen(false);
    setProductSearch("");
    resetForm();
  };

  const onSubmitProgram = async (data: DiscountProgramFormValues) => {
    if (isSubmitting) {
      return;
    }

    const name = data.name.trim();
    const code = data.code.trim().toUpperCase();
    const discountType = data.discountType.trim();
    const discountValue = toOptionalNumber(data.discountValue);

    if (typeof discountValue !== "number" || discountValue <= 0) {
      const message = "Giá trị giảm giá phải lớn hơn 0";
      setFormError(message);
      showWarning(message);
      return;
    }

    const startDate = toOptionalIsoDatetime(data.startDate);
    const endDate = toOptionalIsoDatetime(data.endDate);
    if (startDate && endDate && new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      const message = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
      setFormError(message);
      showWarning(message);
      return;
    }

    const productIds = data.productIds || [];

    const basePayload: AdminCreateDiscountProgramPayload = {
      name,
      code,
      discountType,
      discountValue,
      isActive: data.isActive,
    };

    const description = data.description.trim();
    if (description.length > 0) {
      basePayload.description = description;
    }

    if (startDate) {
      basePayload.startDate = startDate;
    }

    if (endDate) {
      basePayload.endDate = endDate;
    }

    if (productIds.length > 0) {
      basePayload.productIds = productIds;
    }

    setIsSubmitting(true);
    setFormError("");

    const result = editingProgram
      ? await updateAdminDiscountProgram(
          editingProgram.id,
          basePayload as AdminUpdateDiscountProgramPayload
        )
      : await createAdminDiscountProgram(basePayload);

    setIsSubmitting(false);

    if (!result.success) {
      const message = result.message || "Không thể lưu chương trình";
      setFormError(message);
      showError(message);
      return;
    }

    showSuccess(
      result.message ||
        (editingProgram ? "Cập nhật chương trình thành công" : "Tạo chương trình thành công")
    );

    closeForm();
    setReloadToken((prev) => prev + 1);
  };

  const handleProgramDeleted = (programId: string) => {
    setPrograms((prev) => prev.filter((item) => item.id !== programId));
    setMeta((prev) => ({
      ...prev,
      totalItems: Math.max(prev.totalItems - 1, 0),
    }));
    setReloadToken((prev) => prev + 1);
  };

  const formProductIds = watch("productIds") || [];

  const selectedProducts = useMemo(() => {
    const selectedIds = new Set(formProductIds);
    return products.filter((product) => selectedIds.has(product.id));
  }, [formProductIds, products]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? "";
      const slug = product.slug?.toLowerCase() ?? "";
      const id = product.id.toLowerCase();
      return name.includes(keyword) || slug.includes(keyword) || id.includes(keyword);
    });
  }, [productSearch, products]);

  const toggleProductSelection = (productId: string) => {
    const next = formProductIds.includes(productId)
      ? formProductIds.filter((id) => id !== productId)
      : [...formProductIds, productId];
    setValue("productIds", next, { shouldValidate: true });
  };

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPrograms = () => {
    const headers = ["Tên chương trình", "Mã chương trình", "Loại giảm giá", "Giá trị giảm", "Trạng thái", "Ngày bắt đầu", "Ngày kết thúc", "Số sản phẩm áp dụng"];
    const rows = programs.map((program) => [
      program.name || "",
      program.code || "",
      program.discountType || "",
      (program.discountValue ?? 0).toString(),
      program.isActive ? "Đang hoạt động" : "Đã tắt",
      program.startDate ? new Date(program.startDate).toLocaleString("vi-VN") : "",
      program.endDate ? new Date(program.endDate).toLocaleString("vi-VN") : "",
      (program.productIds?.length ?? 0).toString()
    ]);
    downloadCSV("Danh_sach_chuong_trinh_giam_gia.csv", headers, rows);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">
            Quản lý chương trình giảm giá
          </h2>
          <p className="text-xs text-neutral-4 sm:text-sm">{titleDescription}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPrograms}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary-1 bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-1 transition hover:bg-primary-6"
          >
            <FiDownload size={15} />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
          >
            <FiPlus size={15} />
            Tạo chương trình
          </button>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-2xl border border-neutral-20 bg-neutral-10 p-3 md:grid-cols-[minmax(0,1fr),220px,200px,auto]"
      >
        <label className="relative block">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-4"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên hoặc code"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <select
          value={typeInput}
          onChange={(event) => setTypeInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="">Tất cả loại</option>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tắt</option>
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
          >
            <FiFilter size={14} />
            Lọc
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-3 transition hover:border-primary-4 hover:text-neutral-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRotateCcw size={14} />
            Làm mới
          </button>
        </div>
      </form>

      {fetchError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {fetchError}
        </div>
      ) : null}

      <AdminDiscountProgramsTable
        programs={programs}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onProgramDeleted={handleProgramDeleted}
        onProgramEdit={openEditForm}
      />

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-1">
                  {editingProgram ? "Cập nhật chương trình" : "Tạo chương trình"}
                </h3>
                <p className="text-xs text-neutral-4">
                  Nhập thông tin chương trình giảm giá
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-neutral-20 p-2 text-neutral-4 transition hover:border-primary-4 hover:text-neutral-2"
                aria-label="Đóng"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitProgram)} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-neutral-2 sm:col-span-2">
                <span className="text-xs font-medium text-neutral-4">Tên chương trình *</span>
                <input
                  type="text"
                  {...register("name", {
                    required: "Vui lòng nhập tên chương trình",
                    setValueAs: (v: string) => v.trim(),
                  })}
                  placeholder="Summer Sale"
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                />
                {errors.name && (
                  <span className="text-xs text-red-600 block mt-1">{errors.name.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2">
                <span className="text-xs font-medium text-neutral-4">Mã chương trình *</span>
                <input
                  type="text"
                  {...register("code", {
                    required: "Vui lòng nhập mã chương trình",
                    setValueAs: (v: string) => v.trim().toUpperCase(),
                  })}
                  placeholder="SUMMER2026"
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm uppercase outline-none focus:border-primary-1"
                />
                {errors.code && (
                  <span className="text-xs text-red-600 block mt-1">{errors.code.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2">
                <span className="text-xs font-medium text-neutral-4">Loại giảm giá *</span>
                <select
                  {...register("discountType", {
                    required: "Vui lòng chọn loại giảm giá",
                  })}
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                >
                  <option value="">Chọn loại</option>
                  <option value="PERCENT">PERCENT</option>
                  <option value="FIXED">FIXED</option>
                </select>
                {errors.discountType && (
                  <span className="text-xs text-red-600 block mt-1">{errors.discountType.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2">
                <span className="text-xs font-medium text-neutral-4">Giá trị giảm *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register("discountValue", {
                    required: "Giá trị giảm giá phải lớn hơn 0",
                    validate: {
                      positive: (val) => {
                        const num = Number(val);
                        if (Number.isNaN(num) || num <= 0) {
                          return "Giá trị giảm giá phải lớn hơn 0";
                        }
                        return true;
                      }
                    }
                  })}
                  placeholder="10"
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                />
                {errors.discountValue && (
                  <span className="text-xs text-red-600 block mt-1">{errors.discountValue.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2">
                <span className="text-xs font-medium text-neutral-4">Bắt đầu *</span>
                <input
                  type="datetime-local"
                  {...register("startDate", {
                    required: "Vui lòng chọn thời gian bắt đầu",
                    onChange: () => {
                      void trigger("endDate");
                    }
                  })}
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                />
                {errors.startDate && (
                  <span className="text-xs text-red-600 block mt-1">{errors.startDate.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2">
                <span className="text-xs font-medium text-neutral-4">Kết thúc *</span>
                <input
                  type="datetime-local"
                  {...register("endDate", {
                    required: "Vui lòng chọn thời gian kết thúc",
                    validate: {
                      greaterThanStart: (value) => {
                        const start = watch("startDate");
                        if (start && value && new Date(start).getTime() >= new Date(value).getTime()) {
                          return "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
                        }
                        return true;
                      }
                    }
                  })}
                  className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                />
                {errors.endDate && (
                  <span className="text-xs text-red-600 block mt-1">{errors.endDate.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm text-neutral-2 sm:col-span-2">
                <span className="text-xs font-medium text-neutral-4">Mô tả</span>
                <textarea
                  {...register("description")}
                  placeholder="Giảm giá tháng 6"
                  rows={3}
                  className="min-h-24 w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-sm outline-none focus:border-primary-1"
                />
              </label>

              <label className="space-y-1 text-sm text-neutral-2 sm:col-span-2">
                <span className="text-xs font-medium text-neutral-4">Sản phẩm áp dụng *</span>
                <div className="relative" ref={productSelectRef}>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    onFocus={() => setIsProductSelectOpen(true)}
                    placeholder="Tìm sản phẩm theo tên, slug hoặc ID"
                    className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                  />

                  {isProductSelectOpen ? (
                    <div className="absolute z-10 mt-2 max-h-64 w-full overflow-hidden rounded-lg border border-neutral-20 bg-white shadow-sm">
                      {isLoadingProducts ? (
                        <div className="px-3 py-2 text-sm text-neutral-4">
                          Đang tải danh sách sản phẩm...
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-neutral-4">
                          Không có sản phẩm phù hợp
                        </div>
                      ) : (
                        <ul className="max-h-64 overflow-auto py-1">
                           {filteredProducts.map((product) => {
                            const isSelected = formProductIds.includes(product.id);

                            return (
                              <li key={product.id}>
                                <button
                                  type="button"
                                  onClick={() => toggleProductSelection(product.id)}
                                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-neutral-10 ${
                                    isSelected ? "bg-primary-6 text-primary-1" : "text-neutral-2"
                                  }`}
                                >
                                  <span className="line-clamp-1">
                                    {product.name || product.slug || product.id}
                                  </span>
                                  {isSelected ? (
                                    <span className="text-xs font-semibold">Đã chọn</span>
                                  ) : null}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProducts.length === 0 ? (
                    <span className="text-xs text-neutral-4">Chưa chọn sản phẩm nào.</span>
                  ) : (
                    selectedProducts.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-neutral-10 px-3 py-1 text-xs text-neutral-2"
                      >
                        {product.name || product.slug || product.id}
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(product.id)}
                          className="text-neutral-4 transition hover:text-neutral-2"
                          aria-label="Xóa sản phẩm"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                {errors.productIds && (
                  <span className="text-xs text-red-600 block mt-1">{errors.productIds.message}</span>
                )}

                {isProductSelectOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsProductSelectOpen(false)}
                    className="mt-2 text-xs text-neutral-4 underline"
                  >
                    Đóng danh sách sản phẩm
                  </button>
                ) : null}
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-2 sm:col-span-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-neutral-20 text-primary-1 focus:ring-primary-1"
                />
                Kích hoạt chương trình
              </label>

              {formError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-3 transition hover:border-primary-4 hover:text-neutral-2"
                >
                  <FiX size={14} />
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave size={14} />
                  {isSubmitting ? "Đang lưu..." : "Lưu chương trình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
