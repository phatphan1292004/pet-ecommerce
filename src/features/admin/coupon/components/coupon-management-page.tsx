"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
  const [formValues, setFormValues] = useState<CouponFormValues>(createDefaultFormValues());
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showError, showSuccess, showWarning } = useToast();

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
    setFormValues(createDefaultFormValues());
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
    setFormValues({
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

  const handleFieldChange = (field: keyof CouponFormValues, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const code = formValues.code.trim().toUpperCase();
    const discountType = formValues.discountType.trim();
    const discountValue = toOptionalNumber(formValues.discountValue);

    if (code.length === 0) {
      const message = "Vui long nhap ma coupon";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (discountType.length === 0) {
      const message = "Vui long nhap loai giam gia";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (typeof discountValue !== "number" || discountValue <= 0) {
      const message = "Gia tri giam gia phai lon hon 0";
      setFormError(message);
      showWarning(message);
      return;
    }

    const startDate = toOptionalIsoDatetime(formValues.startDate);
    const endDate = toOptionalIsoDatetime(formValues.endDate);
    if (startDate && endDate && new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      const message = "Thoi gian ket thuc phai lon hon thoi gian bat dau";
      setFormError(message);
      showWarning(message);
      return;
    }

    const minOrderValue = toOptionalNumber(formValues.minOrderValue);
    const maxDiscount = toOptionalNumber(formValues.maxDiscount);
    const usageLimit = toOptionalNumber(formValues.usageLimit);

    if (typeof minOrderValue === "number" && minOrderValue < 0) {
      const message = "Don toi thieu khong duoc am";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (typeof maxDiscount === "number" && maxDiscount < 0) {
      const message = "Giam toi da khong duoc am";
      setFormError(message);
      showWarning(message);
      return;
    }

    if (typeof usageLimit === "number" && usageLimit < 0) {
      const message = "So luot su dung khong duoc am";
      setFormError(message);
      showWarning(message);
      return;
    }

    const basePayload: AdminCreateCouponPayload = {
      code,
      discountType,
      discountValue,
      isActive: formValues.isActive,
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

    const description = formValues.description.trim();
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

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Quan ly coupon</h2>
          <p className="text-xs text-neutral-4 sm:text-sm">{titleDescription}</p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
        >
          <FiPlus size={15} />
          Tao coupon
        </button>
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
            placeholder="Tim theo ma coupon"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <input
          type="text"
          value={typeInput}
          onChange={(event) => setTypeInput(event.target.value)}
          placeholder="Loai giam gia (PERCENT/FIXED...)"
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        />

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tat ca trang thai</option>
          <option value="active">Dang hoat dong</option>
          <option value="inactive">Da tat</option>
        </select>

        <div className="flex items-center gap-2 md:justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1"
          >
            <FiFilter size={15} />
            Loc
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
            Dat lai
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
                {editingCoupon ? "Cap nhat coupon" : "Tao coupon moi"}
              </h3>
              <p className="text-xs text-neutral-4">
                Dien thong tin coupon theo API backend /admin/coupons
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
            >
              <FiX size={14} />
              Dong
            </button>
          </div>

          <form onSubmit={handleSubmitCoupon} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Ma coupon *</span>
              <input
                type="text"
                value={formValues.code}
                onChange={(event) => handleFieldChange("code", event.target.value)}
                placeholder="VD: PET10"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                required
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Loai giam gia *</span>
              <input
                type="text"
                value={formValues.discountType}
                onChange={(event) => handleFieldChange("discountType", event.target.value)}
                placeholder="PERCENT, FIXED..."
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                required
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Gia tri giam gia *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formValues.discountValue}
                onChange={(event) => handleFieldChange("discountValue", event.target.value)}
                placeholder="VD: 10 hoac 50000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
                required
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">So luot su dung toi da</span>
              <input
                type="number"
                min="0"
                value={formValues.usageLimit}
                onChange={(event) => handleFieldChange("usageLimit", event.target.value)}
                placeholder="Bo trong neu khong gioi han"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Don toi thieu</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formValues.minOrderValue}
                onChange={(event) => handleFieldChange("minOrderValue", event.target.value)}
                placeholder="VD: 200000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Giam toi da</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formValues.maxDiscount}
                onChange={(event) => handleFieldChange("maxDiscount", event.target.value)}
                placeholder="VD: 100000"
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Bat dau</span>
              <input
                type="datetime-local"
                value={formValues.startDate}
                onChange={(event) => handleFieldChange("startDate", event.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2">
              <span className="text-xs font-medium text-neutral-4">Ket thuc</span>
              <input
                type="datetime-local"
                value={formValues.endDate}
                onChange={(event) => handleFieldChange("endDate", event.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-20 bg-white px-3 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="space-y-1 text-sm text-neutral-2 md:col-span-2">
              <span className="text-xs font-medium text-neutral-4">Mo ta</span>
              <textarea
                value={formValues.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Mo ta coupon"
                rows={3}
                className="w-full rounded-lg border border-neutral-20 bg-white px-3 py-2 text-sm outline-none focus:border-primary-1"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-2 md:col-span-2">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={(event) => handleFieldChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-neutral-20 text-primary-1 focus:ring-primary-1"
              />
              Kich hoat coupon
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
                Huy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-4 bg-primary-6 px-3 text-sm font-semibold text-primary-1 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={15} />
                {isSubmitting ? "Dang luu..." : editingCoupon ? "Cap nhat" : "Tao moi"}
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
