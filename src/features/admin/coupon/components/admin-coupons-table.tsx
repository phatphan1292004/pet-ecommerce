"use client";

import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FiAlertTriangle, FiEdit2, FiLoader, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { useToast } from "@/hooks";
import {
  deleteAdminCoupon,
  type AdminCoupon,
  type AdminCouponsMeta,
} from "@/features/admin/coupon/servers";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

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

const normalizeDiscountType = (value?: string) => {
  if (!value || value.trim().length === 0) {
    return "--";
  }

  const normalized = value.trim().toUpperCase();

  if (normalized.includes("PERCENT")) {
    return "PERCENT";
  }

  if (normalized.includes("FIX") || normalized.includes("AMOUNT")) {
    return "FIXED";
  }

  return normalized;
};

const formatDiscountValue = (coupon: AdminCoupon) => {
  if (typeof coupon.discountValue !== "number" || !Number.isFinite(coupon.discountValue)) {
    return "--";
  }

  const normalizedType = normalizeDiscountType(coupon.discountType);
  if (normalizedType === "PERCENT") {
    return `${coupon.discountValue}%`;
  }

  return formatCurrency(coupon.discountValue);
};

const getStatusBadgeClass = (isActive?: boolean) => {
  if (isActive === true) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (isActive === false) {
    return "border-neutral-20 bg-neutral-10 text-neutral-4";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getStatusLabel = (isActive?: boolean) => {
  if (isActive === true) {
    return "Đang hoạt động";
  }

  if (isActive === false) {
    return "Đã tắt";
  }

  return "Chưa rõ";
};

const buildPageList = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
};

interface ActionCellProps {
  coupon: AdminCoupon;
  onCouponDeleted?: (couponId: string) => void;
  onCouponEdit?: (coupon: AdminCoupon) => void;
}

function ActionCell({ coupon, onCouponDeleted, onCouponEdit }: ActionCellProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleDelete = () => {
    const couponCode = coupon.code || coupon.id;
    if (!window.confirm(`Ban co chac muon xoa coupon ${couponCode}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAdminCoupon(coupon.id);
      if (result.success) {
        showSuccess(result.message || "Xoa coupon thanh cong");
        onCouponDeleted?.(coupon.id);
        return;
      }

      const message = result.message || "Xoa coupon that bai";
      setDeleteError(message);
      showError(message);
      setTimeout(() => setDeleteError(""), 3000);
    });
  };

  return (
    <div className="min-w-28 text-right sm:min-w-42">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onCouponEdit?.(coupon)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
          title="Cap nhat"
        >
          <FiEdit2 size={13} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title={deleteError || "Xoa coupon"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <FiLoader className="animate-spin" size={13} /> : <FiTrash2 size={13} />}
          {isPending ? "Dang xoa" : ""}
        </button>

        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-neutral-20 bg-white px-2.5 py-2.5 text-neutral-4 transition hover:border-primary-4 hover:text-neutral-2"
          title="Tuy chon"
          aria-label="Tuy chon"
        >
          <FiMoreVertical size={13} />
        </button>
      </div>

      {deleteError ? (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-600">
          <FiAlertTriangle size={12} />
          {deleteError}
        </p>
      ) : null}
    </div>
  );
}

interface AdminCouponsTableProps {
  coupons: AdminCoupon[];
  meta: AdminCouponsMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onCouponDeleted?: (couponId: string) => void;
  onCouponEdit?: (coupon: AdminCoupon) => void;
}

export default function AdminCouponsTable({
  coupons,
  meta,
  isLoading,
  onPageChange,
  onLimitChange,
  onCouponDeleted,
  onCouponEdit,
}: AdminCouponsTableProps) {
  const columns = useMemo<ColumnDef<AdminCoupon>[]>(
    () => [
      {
        id: "code",
        header: "Coupon",
        cell: ({ row }) => (
          <div className="min-w-48">
            <p className="font-semibold uppercase text-neutral-1">{row.original.code || "--"}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-4">
              {row.original.description || "Khong co mo ta"}
            </p>
          </div>
        ),
      },
      {
        id: "discount",
        header: "Mức giảm",
        cell: ({ row }) => (
          <div className="min-w-35">
            <p className="font-semibold text-neutral-1">{formatDiscountValue(row.original)}</p>
            <p className="text-xs text-neutral-4">{normalizeDiscountType(row.original.discountType)}</p>
          </div>
        ),
      },
      {
        id: "condition",
        header: "Điều kiện",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-neutral-4">
            <p>Đơn tối thiểu: {formatCurrency(row.original.minOrderValue)}</p>
            <p>Giảm tối đa: {formatCurrency(row.original.maxDiscount)}</p>
          </div>
        ),
      },
      {
        id: "period",
        header: "Thời gian",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-neutral-4">
            <p>Bắt đầu: {formatDateTime(row.original.startDate)}</p>
            <p>Kết thúc: {formatDateTime(row.original.endDate)}</p>
          </div>
        ),
      },
      {
        id: "usage",
        header: "Sử dụng",
        cell: ({ row }) => {
          const used = row.original.usedCount;
          const limit = row.original.usageLimit;
          const usageText =
            typeof used === "number" || typeof limit === "number"
              ? `${typeof used === "number" ? used : 0}/${typeof limit === "number" ? limit : "--"}`
              : "--";

          return <span className="font-medium text-neutral-2">{usageText}</span>;
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              row.original.isActive
            )}`}
          >
            {getStatusLabel(row.original.isActive)}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-neutral-2">
            {formatDateTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
          <ActionCell
            coupon={row.original}
            onCouponDeleted={onCouponDeleted}
            onCouponEdit={onCouponEdit}
          />
        ),
      },
    ],
    [onCouponDeleted, onCouponEdit]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta.totalPages,
    state: {
      pagination: {
        pageIndex: Math.max(meta.page - 1, 0),
        pageSize: meta.limit,
      },
    },
  });

  const columnAlign: Record<string, "left" | "right"> = {
    usage: "right",
    status: "right",
    updatedAt: "right",
    actions: "right",
  };

  const columnResponsiveClass: Record<string, string> = {
    updatedAt: "hidden lg:table-cell",
  };

  const displayPages = useMemo(
    () => buildPageList(meta.page, Math.max(meta.totalPages, 1)),
    [meta.page, meta.totalPages]
  );

  const hasRows = table.getRowModel().rows.length > 0;
  const startItem = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.totalItems);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-neutral-20 bg-white">
        <table className="w-full min-w-262.5 text-left text-sm">
          <thead className="bg-neutral-10 text-xs font-semibold uppercase text-neutral-4">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 ${
                      columnAlign[header.column.id] === "right" ? "text-right" : "text-left"
                    } ${columnResponsiveClass[header.column.id] ?? ""}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-neutral-20 text-neutral-1">
            {isLoading ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-8 text-center text-sm text-neutral-4"
                >
                  Dang tai danh sach coupon...
                </td>
              </tr>
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="align-top">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-4 ${
                        columnAlign[cell.column.id] === "right" ? "text-right" : "text-left"
                      } ${columnResponsiveClass[cell.column.id] ?? ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-8 text-center text-sm text-neutral-4"
                >
                  Chua co coupon nao.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-20 bg-neutral-10 px-4 py-3 text-sm text-neutral-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          Hien thi <span className="font-semibold text-neutral-1">{startItem}</span> -{" "}
          <span className="font-semibold text-neutral-1">{endItem}</span> tren tong{" "}
          <span className="font-semibold text-neutral-1">{meta.totalItems}</span> coupon
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
          <label htmlFor="admin-coupon-page-size" className="text-xs text-neutral-4">
            So dong/trang
          </label>
          <select
            id="admin-coupon-page-size"
            value={meta.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-lg border border-neutral-20 bg-white px-2 py-1 text-sm text-neutral-2 outline-none focus:border-primary-1"
            disabled={isLoading}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => onPageChange(meta.page - 1)}
              disabled={!meta.hasPrevPage || isLoading}
              className="rounded-lg border border-neutral-20 bg-white px-3 py-1.5 text-sm text-neutral-2 transition enabled:hover:border-primary-1 enabled:hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Truoc
            </button>

            {displayPages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  pageNumber === meta.page
                    ? "border-primary-1 bg-primary-1 text-white"
                    : "border-neutral-20 bg-white text-neutral-2 hover:border-primary-1 hover:text-primary-1"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPageChange(meta.page + 1)}
              disabled={!meta.hasNextPage || isLoading}
              className="rounded-lg border border-neutral-20 bg-white px-3 py-1.5 text-sm text-neutral-2 transition enabled:hover:border-primary-1 enabled:hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
