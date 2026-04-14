"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FiAlertTriangle, FiEye, FiLoader, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import {
  formatCurrency,
  formatDateTime,
  getNameInitials,
  getOrderStatusLabel,
  getOrderStatusStyles,
  getPaymentMethodLabel,
  getShortOrderId,
} from "@/features/admin/order/utils";
import { deleteAdminOrder, type AdminOrder, type AdminOrdersMeta } from "@/features/admin/order/servers";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const getCustomerDisplayName = (order: AdminOrder) => {
  if (order.arrivalName && order.arrivalName.trim().length > 0) {
    return order.arrivalName.trim();
  }

  if (order.customerId && order.customerId.trim().length > 0) {
    return order.customerId;
  }

  return "Khách hàng";
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
  order: AdminOrder;
  onOrderDeleted?: (orderId: string) => void;
}

function ActionCell({ order, onOrderDeleted }: ActionCellProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string>("");

  const handleDelete = () => {
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${getShortOrderId(order._id, "--")}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAdminOrder(order._id);
      if (result.success) {
        onOrderDeleted?.(order._id);
      } else {
        setDeleteError(result.message || "Xóa đơn hàng thất bại");
        setTimeout(() => setDeleteError(""), 3000);
      }
    });
  };

  return (
    <div className="min-w-24 text-right sm:min-w-51.25">
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/order/${order._id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
        >
          <FiEye size={13} />
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title={deleteError || "Xóa đơn hàng"}
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

interface AdminOrdersTableProps {
  orders: AdminOrder[];
  meta: AdminOrdersMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOrderDeleted?: (orderId: string) => void;
}

export default function AdminOrdersTable({
  orders,
  meta,
  isLoading,
  onPageChange,
  onLimitChange,
  onOrderDeleted,
}: AdminOrdersTableProps) {
  const columns = useMemo<ColumnDef<AdminOrder>[]>(
    () => [
      {
        id: "orderId",
        header: "Mã đơn",
        cell: ({ row }) => {
          const orderId = row.original._id;
          const shortId = getShortOrderId(orderId, "--");
          return (
            <div>
              <p className="font-semibold text-neutral-1">#{shortId}</p>
              <p className="text-xs text-neutral-4">{formatDateTime(row.original.createdAt)}</p>
            </div>
          );
        },
      },
      {
        id: "customer",
        header: "Khách hàng",
        cell: ({ row }) => {
          const customerName = getCustomerDisplayName(row.original);
          const initials = getNameInitials(customerName);

          return (
            <div className="flex min-w-56 items-center gap-3 sm:min-w-62.5">
              {row.original.customerPhotoURL ? (
                // Backend returns dynamic external avatar URLs, so plain img avoids strict domain config coupling.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.original.customerPhotoURL}
                  alt={customerName}
                  className="h-9 w-9 rounded-full border border-neutral-20 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-5 text-xs font-semibold text-primary-1">
                  {initials}
                </div>
              )}

              <div>
                <p className="font-medium text-neutral-1">{customerName}</p>
                <p className="text-xs text-neutral-4">{row.original.arrivalPhone || "--"}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-4 lg:hidden">
                  {row.original.arrivalAddress || "--"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "address",
        header: "Địa chỉ nhận",
        cell: ({ row }) => (
          <p className="max-w-[320px] text-sm text-neutral-4">{row.original.arrivalAddress || "--"}</p>
        ),
      },
      {
        id: "payment",
        header: "Thanh toán",
        cell: ({ row }) => (
          <span className="text-neutral-2">{getPaymentMethodLabel(row.original.paymentMethod)}</span>
        ),
      },
      {
        id: "total",
        header: "Tổng tiền",
        cell: ({ row }) => {
          const totalPrice = row.original.finalPrice ?? row.original.totalPrice;
          return <span className="font-semibold text-neutral-1">{formatCurrency(totalPrice)}</span>;
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusStyles(
              row.original.status,
              { includeProcessing: false }
            )}`}
          >
            {getOrderStatusLabel(row.original.status, { includeProcessing: false })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => <ActionCell order={row.original} onOrderDeleted={onOrderDeleted} />,
      },
    ],
    [onOrderDeleted]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: orders,
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
    total: "right",
    status: "right",
    actions: "right",
  };

  const columnResponsiveClass: Record<string, string> = {
    address: "hidden lg:table-cell",
    total: "hidden md:table-cell",
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
        <table className="w-full min-w-245 text-left text-sm">
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
                  Đang tải dữ liệu đơn hàng...
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
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-20 bg-neutral-10 px-4 py-3 text-sm text-neutral-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          Hiển thị <span className="font-semibold text-neutral-1">{startItem}</span> -{" "}
          <span className="font-semibold text-neutral-1">{endItem}</span> trên tổng{" "}
          <span className="font-semibold text-neutral-1">{meta.totalItems}</span> đơn hàng
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
          <label htmlFor="admin-order-page-size" className="text-xs text-neutral-4">
            Số dòng/trang
          </label>
          <select
            id="admin-order-page-size"
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
              Trước
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
