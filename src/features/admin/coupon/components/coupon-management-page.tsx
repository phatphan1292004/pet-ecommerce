"use client";

import { useEffect, useMemo, useState } from "react";
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
import AdminCouponsTable from "@/features/admin/coupon/components/admin-coupons-table";
import {
  createAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
  type AdminCoupon,
  type AdminCouponsMeta,
  type AdminCreateCouponPayload,
  type AdminUpdateCouponPayload,
} from "@/features/admin/coupon/servers";

interface CouponManagementPageProps {
  initialCoupons: AdminCoupon[];
  initialMeta: AdminCouponsMeta;
  errorMessage?: string;
}

interface CouponFormValues {
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

const createDefaultFormValues = (): CouponFormValues => ({
  code: "",
  discountType: "",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  startDate: "",
  endDate: "",
  description: "",
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

export default function CouponManagementPage({
  initialCoupons,
  initialMeta,
  errorMessage = "",
}: CouponManagementPageProps) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(initialCoupons);
  const [meta, setMeta] = useState<AdminCouponsMeta>(initialMeta);
  const [page, setPage] = useState(initialMeta.page);
  const [limit, setLimit] = useState(initialMeta.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(errorMessage);
  const [reloadToken, setReloadToken] = useState(0);

  const [codeInput, setCodeInput] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showError, showSuccess, showWarning } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    defaultValues: createDefaultFormValues(),
  });

  useEffect(() => {
    if (
      reloadToken === 0 &&
      page === initialMeta.page &&
      limit === initialMeta.limit &&
      codeFilter.length === 0 &&
      typeFilter.length === 0 &&
      statusFilter === "all"
    ) {
      return;
    }

    let isMounted = true;

    const loadCoupons = async () => {
      setIsLoading(true);
      setFetchError("");

      const result = await getAdminCoupons({
        page,
        limit,
        code: codeFilter || undefined,
        discountType: typeFilter || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setCoupons([]);
        setMeta({
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
        setFetchError(result.message || "Khong the tai danh sach coupon");
        setIsLoading(false);
        return;
      }

      setCoupons(result.data.items);
      setMeta(result.data.meta);
      setIsLoading(false);
    };

    void loadCoupons();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    limit,
    codeFilter,
    typeFilter,
    statusFilter,
    reloadToken,
    initialMeta.page,
    initialMeta.limit,
  ]);

  const hasActiveFilters =
    codeFilter.length > 0 || typeFilter.length > 0 || statusFilter !== "all";

  const titleDescription = useMemo(
    () =>
      `Tong ${meta.totalItems.toLocaleString("vi-VN")} coupon · Trang ${meta.page}/${Math.max(meta.totalPages, 1)}`,
    [meta.totalItems, meta.page, meta.totalPages]
  );

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCodeFilter(codeInput.trim());
    setTypeFilter(typeInput.trim());
    setStatusFilter(statusInput);
    setPage(1);
  };

  const resetFilters = () => {
    setCodeInput("");
    setCodeFilter("");
    setTypeInput("");
    setTypeFilter("");
    setStatusInput("all");
    setStatusFilter("all");
    setPage(1);
  };

  const resetForm = () => {
    reset(createDefaultFormValues());
    setFormError("");
    setEditingCoupon(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setFormError("");
    reset({
      code: coupon.code || "",
      discountType: coupon.discountType || "",
      discountValue:
        typeof coupon.discountValue === "number" && Number.isFinite(coupon.discountValue)
          ? String(coupon.discountValue)
          : "",
      minOrderValue:
        typeof coupon.minOrderValue === "number" && Number.isFinite(coupon.minOrderValue)
          ? String(coupon.minOrderValue)
          : "",
      maxDiscount:
        typeof coupon.maxDiscount === "number" && Number.isFinite(coupon.maxDiscount)
          ? String(coupon.maxDiscount)
          : "",
      usageLimit:
        typeof coupon.usageLimit === "number" && Number.isFinite(coupon.usageLimit)
          ? String(coupon.usageLimit)
          : "",
      startDate: toDatetimeLocalInput(coupon.startDate),
      endDate: toDatetimeLocalInput(coupon.endDate),
      description: coupon.description || "",
      isActive: coupon.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const onSubmitCoupon = async (data: CouponFormValues) => {
    if (isSubmitting) {
      return;
    }

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

    const minOrderValue = toOptionalNumber(data.minOrderValue);
    const maxDiscount = toOptionalNumber(data.maxDiscount);
    const usageLimit = toOptionalNumber(data.usageLimit);

    const basePayload: AdminCreateCouponPayload = {
      code,
      discountType,
      discountValue,
      isActive: data.isActive,
    };

    if (typeof minOrderValue === "number") {
      basePayload.minOrderValue = minOrderValue;
    }

    if (typeof maxDiscount === "number") {
      basePayload.maxDiscount = maxDiscount;
    }

    if (typeof usageLimit === "number") {
      basePayload.usageLimit = usageLimit;
    }

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

    setIsSubmitting(true);
    setFormError("");

    const result = editingCoupon
      ? await updateAdminCoupon(editingCoupon.id, basePayload as AdminUpdateCouponPayload)
      : await createAdminCoupon(basePayload);

    setIsSubmitting(false);

    if (!result.success) {
      const message = result.message || "Khong the luu coupon";
      setFormError(message);
      showError(message);
      return;
    }

    showSuccess(
      result.message || (editingCoupon ? "Cap nhat coupon thanh cong" : "Tao coupon thanh cong")
    );

    closeForm();
    setReloadToken((prev) => prev + 1);
  };

  const handleCouponDeleted = (couponId: string) => {
    setCoupons((prev) => prev.filter((item) => item.id !== couponId));
    setMeta((prev) => ({
      ...prev,
      totalItems: Math.max(prev.totalItems - 1, 0),
    }));
    setReloadToken((prev) => prev + 1);
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

  const handleExportCoupons = () => {
    const headers = ["Mã coupon", "Loại giảm giá", "Giá trị giảm", "Đơn tối thiểu (VND)", "Giảm tối đa (VND)", "Giới hạn sử dụng", "Trạng thái", "Ngày bắt đầu", "Ngày kết thúc"];
    const rows = coupons.map((coupon) => [
      coupon.code || "",
      coupon.discountType || "",
      (coupon.discountValue ?? 0).toString(),
      (coupon.minOrderValue ?? 0).toString(),
      (coupon.maxDiscount ?? 0).toString(),
      (coupon.usageLimit ?? 0).toString(),
      coupon.isActive ? "Đang hoạt động" : "Đã tắt",
      coupon.startDate ? new Date(coupon.startDate).toLocaleString("vi-VN") : "",
      coupon.endDate ? new Date(coupon.endDate).toLocaleString("vi-VN") : ""
    ]);
    downloadCSV("Danh_sach_coupons.csv", headers, rows);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Quản lý coupon</h2>
          <p className="text-xs text-neutral-4 sm:text-sm">{titleDescription}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCoupons}
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
            Tạo coupon
          </button>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-2xl border border-neutral-20 bg-neutral-10 p-3 md:grid-cols-[minmax(0,1fr),minmax(0,1fr),220px,auto]"
      >
        <label className="relative block">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-4"
          />
          <input
            type="text"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            placeholder="Tìm theo mã coupon"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <input
          type="text"
          value={typeInput}
          onChange={(event) => setTypeInput(event.target.value)}
          placeholder="Loại giảm giá (PERCENT/FIXED...)"
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        />

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tắt</option>
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
            onClick={resetFilters}
            disabled={
              !hasActiveFilters &&
              codeInput.length === 0 &&
              typeInput.length === 0 &&
              statusInput === "all"
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRotateCcw size={15} />
            Đặt lại
          </button>
        </div>
      </form>

      {hasActiveFilters ? (
        <p className="text-xs text-neutral-4">
          Dang loc: <span className="font-semibold text-neutral-2">{codeFilter || "--"}</span>
          {typeFilter ? (
            <>
              {" "}
              · Loai <span className="font-semibold text-neutral-2">{typeFilter}</span>
            </>
          ) : null}
          {statusFilter !== "all" ? (
            <>
              {" "}
              · Trang thai <span className="font-semibold text-neutral-2">{statusFilter}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {fetchError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {fetchError}
        </div>
      ) : null}

      {isFormOpen ? (
        <article className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-1 sm:text-base">
                {editingCoupon ? "Cập nhật coupon" : "Tạo coupon mới"}
              </h3>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
            >
              <FiX size={14} />
              Đóng
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmitCoupon)} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Mã coupon *</span>
              <input
                type="text"
                {...register("code", {
                  required: "Vui lòng nhập mã coupon",
                  setValueAs: (v: string) => v.trim().toUpperCase(),
                })}
                placeholder="VD: PET10"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.code && (
                <span className="text-xs text-red-600 block mt-1">{errors.code.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Loại giảm giá *</span>
              <input
                type="text"
                {...register("discountType", {
                  required: "Vui lòng nhập loại giảm giá",
                  setValueAs: (v: string) => v.trim(),
                })}
                placeholder="PERCENT, FIXED..."
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.discountType && (
                <span className="text-xs text-red-600 block mt-1">{errors.discountType.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giá trị giảm giá *</span>
              <input
                type="number"
                min="0"
                step="0.01"
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
                placeholder="VD: 10 hoac 50000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.discountValue && (
                <span className="text-xs text-red-600 block mt-1">{errors.discountValue.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Số lượt sử dụng tối đa</span>
              <input
                type="number"
                min="0"
                {...register("usageLimit", {
                  validate: {
                    nonNegative: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0) {
                        return "Số lượt sử dụng không được âm";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="Bỏ trong nếu không giới hạn"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.usageLimit && (
                <span className="text-xs text-red-600 block mt-1">{errors.usageLimit.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Đơn tối thiểu</span>
              <input
                type="number"
                min="0"
                step="1000"
                {...register("minOrderValue", {
                  validate: {
                    nonNegative: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0) {
                        return "Đơn tối thiểu không được âm";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="VD: 200000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.minOrderValue && (
                <span className="text-xs text-red-600 block mt-1">{errors.minOrderValue.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giảm tối đa</span>
              <input
                type="number"
                min="0"
                step="1000"
                {...register("maxDiscount", {
                  validate: {
                    nonNegative: (val) => {
                      if (!val) return true;
                      const num = Number(val);
                      if (Number.isNaN(num) || num < 0) {
                        return "Giảm tối đa không được âm";
                      }
                      return true;
                    }
                  }
                })}
                placeholder="VD: 100000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
              {errors.maxDiscount && (
                <span className="text-xs text-red-600 block mt-1">{errors.maxDiscount.message}</span>
              )}
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Bắt đầu</span>
              <input
                type="datetime-local"
                {...register("startDate")}
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Kết thúc</span>
              <input
                type="datetime-local"
                {...register("endDate", {
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

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mô tả</span>
              <textarea
                {...register("description")}
                placeholder="Mo ta coupon"
                rows={3}
                className="w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-2 md:col-span-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-neutral-20 text-primary-1 focus:ring-primary-1"
              />
              Kích hoạt coupon
            </label>

            {formError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:col-span-2">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiX size={15} />
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={15} />
                {isSubmitting ? "Đang lưu..." : editingCoupon ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      <AdminCouponsTable
        coupons={coupons}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(nextLimit: number) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        onCouponDeleted={handleCouponDeleted}
        onCouponEdit={openEditForm}
      />
    </section>
  );
}
