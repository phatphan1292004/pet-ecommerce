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
  deleteAdminDiscountProgram,
  type AdminDiscountProgram,
  type AdminDiscountProgramsMeta,
} from "@/features/admin/discount-program/servers";

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

const formatDiscountValue = (program: AdminDiscountProgram) => {
  if (typeof program.discountValue !== "number" || !Number.isFinite(program.discountValue)) {
    return "--";
  }

  const normalizedType = normalizeDiscountType(program.discountType);
  if (normalizedType === "PERCENT") {
    return `${program.discountValue}%`;
  }

  return formatCurrency(program.discountValue);
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
  program: AdminDiscountProgram;
  onProgramDeleted?: (programId: string) => void;
  onProgramEdit?: (program: AdminDiscountProgram) => void;
}

function ActionCell({ program, onProgramDeleted, onProgramEdit }: ActionCellProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleDelete = () => {
    const programName = program.name || program.code || program.id;
    if (!window.confirm(`Bạn có chắc muốn xóa chương trình ${programName}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAdminDiscountProgram(program.id);
      if (result.success) {
        showSuccess(result.message || "Xóa chương trình thành công");
        onProgramDeleted?.(program.id);
        return;
      }

      const message = result.message || "Xóa chương trình thất bại";
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
          onClick={() => onProgramEdit?.(program)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
          title="Cập nhật"
        >
          <FiEdit2 size={13} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title={deleteError || "Xóa chương trình"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <FiLoader className="animate-spin" size={13} /> : <FiTrash2 size={13} />}
          {isPending ? "Đang xóa" : ""}
        </button>

        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-neutral-20 bg-white px-2.5 py-2.5 text-neutral-4 transition hover:border-primary-4 hover:text-neutral-2"
          title="Tùy chọn"
          aria-label="Tùy chọn"
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

interface AdminDiscountProgramsTableProps {
  programs: AdminDiscountProgram[];
  meta: AdminDiscountProgramsMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onProgramDeleted?: (programId: string) => void;
  onProgramEdit?: (program: AdminDiscountProgram) => void;
}

export default function AdminDiscountProgramsTable({
  programs,
  meta,
  isLoading,
  onPageChange,
  onLimitChange,
  onProgramDeleted,
  onProgramEdit,
}: AdminDiscountProgramsTableProps) {
  const columns = useMemo<ColumnDef<AdminDiscountProgram>[]>(
    () => [
      {
        id: "name",
        header: "Chương trình",
        cell: ({ row }) => (
          <div className="min-w-52">
            <p className="font-semibold text-neutral-1">{row.original.name || "--"}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-4">
              {row.original.code || "--"}
            </p>
          </div>
        ),
      },
      {
        id: "discount",
        header: "Mức giảm",
        cell: ({ row }) => (
          <div className="min-w-32">
            <p className="font-semibold text-neutral-1">{formatDiscountValue(row.original)}</p>
            <p className="text-xs text-neutral-4">
              {normalizeDiscountType(row.original.discountType)}
            </p>
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
        id: "products",
        header: "Sản phẩm",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-neutral-2">
            {row.original.productIds?.length ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
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
            program={row.original}
            onProgramDeleted={onProgramDeleted}
            onProgramEdit={onProgramEdit}
          />
        ),
      },
    ],
    [onProgramDeleted, onProgramEdit]
  );

  const table = useReactTable({
    data: programs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageList = buildPageList(meta.page, meta.totalPages);

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-20 bg-white p-3">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-20 text-sm">
          <thead className="bg-neutral-10 text-left text-xs font-semibold uppercase text-neutral-4">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-neutral-20">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-neutral-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-neutral-4">
                  Không có chương trình giảm giá nào
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-neutral-4">
          <span>Trang</span>
          <select
            value={meta.page}
            onChange={(event) => onPageChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-neutral-20 bg-white px-2 text-xs text-neutral-2"
          >
            {pageList.map((pageNumber) => (
              <option key={pageNumber} value={pageNumber}>
                {pageNumber}
              </option>
            ))}
          </select>
          <span>trên {meta.totalPages}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-4">
          <span>Hiển thị</span>
          <select
            value={meta.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-neutral-20 bg-white px-2 text-xs text-neutral-2"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
