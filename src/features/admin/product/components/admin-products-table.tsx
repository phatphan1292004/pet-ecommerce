"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FiAlertTriangle, FiEye, FiLoader, FiTrash2 } from "react-icons/fi";
import { useToast } from "@/hooks";
import {
  deleteAdminProduct,
  type AdminProduct,
  type AdminProductsMeta,
} from "@/features/admin/product/servers";

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

const getProductImage = (product: AdminProduct) => {
  if (product.image && product.image.trim().length > 0) {
    return product.image;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0] || "/logo.png";
  }

  return "/logo.png";
};

const getStatusLabel = (product: AdminProduct) => {
  if (product.isActive === true) {
    return "Đang hoạt động";
  }

  if (product.isActive === false) {
    return "Tạm tắt";
  }

  const status = (product.status || "").trim();
  return status.length > 0 ? status : "Chưa rõ";
};

const getStatusBadgeClass = (product: AdminProduct) => {
  if (product.isActive === true) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (product.isActive === false) {
    return "border-neutral-20 bg-neutral-10 text-neutral-4";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getBrandLabel = (product: AdminProduct) =>
  product.brandName || product.brand?.name || product.brand?.id || "--";

interface ActionCellProps {
  product: AdminProduct;
  onProductDeleted?: (productId: string) => void;
}

function ActionCell({ product, onProductDeleted }: ActionCellProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleDelete = () => {
    const productName = product.name || product.id;
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm ${productName}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAdminProduct(product.id);
      if (result.success) {
        showSuccess(result.message || "Xóa sản phẩm thành công");
        onProductDeleted?.(product.id);
        return;
      }

      const message = result.message || "Xóa sản phẩm thất bại";
      setDeleteError(message);
      showError(message);
      setTimeout(() => setDeleteError(""), 3000);
    });
  };

  return (
    <div className="min-w-20 text-right sm:min-w-28">
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/products/${product.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
          title="Chi tiết"
        >
          <FiEye size={13} />
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title={deleteError || "Xóa sản phẩm"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <FiLoader className="animate-spin" size={13} /> : <FiTrash2 size={13} />}
          {isPending ? "Đang xóa" : ""}
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

interface AdminProductsTableProps {
  products: AdminProduct[];
  meta: AdminProductsMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onProductDeleted?: (productId: string) => void;
}

export default function AdminProductsTable({
  products,
  meta,
  isLoading,
  onPageChange,
  onLimitChange,
  onProductDeleted,
}: AdminProductsTableProps) {
  const columns = useMemo<ColumnDef<AdminProduct>[]>(
    () => [
      {
        id: "product",
        header: "Sản phẩm",
        cell: ({ row }) => {
          const product = row.original;
          const image = getProductImage(product);
          const name = product.name || "Sản phẩm";

          return (
            <div className="flex w-full items-center gap-3">
              <div className="flex h-16 min-w-16 items-center justify-center overflow-hidden rounded-xl border border-neutral-20 bg-neutral-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={name} className="h-full w-full object-cover" />
              </div>

              <div className="w-full">
                <p className="line-clamp-3 text-base font-semibold leading-snug text-neutral-1">
                  {name}
                </p>
                <p className="truncate text-sm text-neutral-4">ID: {product.id}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "brand",
        header: "Thương hiệu",
        cell: ({ row }) => (
          <span className="text-base text-neutral-2">{getBrandLabel(row.original)}</span>
        ),
      },
      {
        id: "price",
        header: "Giá",
        cell: ({ row }) => {
          const product = row.original;
          const price = formatCurrency(product.price);
          const originalPrice = formatCurrency(product.originalPrice);
          const discount =
            typeof product.discount === "number" && Number.isFinite(product.discount)
              ? `-${product.discount}%`
              : "";

          return (
            <div className="text-right">
              <p className="font-semibold text-neutral-1">{price}</p>
              <div className="flex flex-wrap items-center justify-end gap-2 text-base text-neutral-4">
                {product.originalPrice ? (
                  <span className="line-through">{originalPrice}</span>
                ) : null}
                {discount ? <span className="font-medium text-rose-600">{discount}</span> : null}
              </div>
            </div>
          );
        },
      },
      {
        id: "stock",
        header: "Tồn kho",
        cell: ({ row }) => {
          const stock = row.original.stock;
          return (
            <span className="text-base font-medium text-neutral-2">
              {typeof stock === "number" && Number.isFinite(stock) ? stock : "--"}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-base font-semibold ${getStatusBadgeClass(
              row.original
            )}`}
          >
            {getStatusLabel(row.original)}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Tạo lúc",
        cell: ({ row }) => (
          <span className="text-base font-medium text-neutral-2">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
          <ActionCell product={row.original} onProductDeleted={onProductDeleted} />
        ),
      },
    ],
    [onProductDeleted]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
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
    price: "right",
    status: "right",
    createdAt: "right",
    actions: "right",
  };

  const columnWidth: Record<string, string> = {
    product: "w-70",
    brand: "w-28",
    category: "w-40",
    price: "w-24",
    stock: "w-16",
    status: "w-24",
    createdAt: "w-28",
    actions: "w-20",
  };

  const columnResponsiveClass: Record<string, string> = {
    category: "hidden lg:table-cell",
    createdAt: "hidden lg:table-cell",
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
        <table className="w-full min-w-0 table-fixed text-left text-sm">
          <thead className="bg-neutral-10 text-xs font-semibold uppercase text-neutral-4">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 ${
                      columnAlign[header.column.id] === "right" ? "text-right" : "text-left"
                    } ${columnResponsiveClass[header.column.id] ?? ""} ${
                      columnWidth[header.column.id] ?? ""
                    }`}
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
                  Đang tải dữ liệu sản phẩm...
                </td>
              </tr>
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="align-middle">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-4 align-middle ${
                        columnAlign[cell.column.id] === "right" ? "text-right" : "text-left"
                      } ${columnResponsiveClass[cell.column.id] ?? ""} ${
                        columnWidth[cell.column.id] ?? ""
                      }`}
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
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-4">
        <p>
          Hiển thị {startItem}-{endItem} trên tổng <span className="font-semibold text-neutral-1">{meta.totalItems}</span> sản phẩm
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs">Số dòng/trang</span>
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

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(meta.page - 1, 1))}
              disabled={!meta.hasPrevPage}
              className="h-8 rounded-lg border border-neutral-20 bg-white px-3 text-xs text-neutral-2 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trước
            </button>

            {displayPages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 min-w-8 rounded-lg border px-2 text-xs transition ${
                  pageNumber === meta.page
                    ? "border-primary-1 bg-primary-1 text-white"
                    : "border-neutral-20 bg-white text-neutral-2 hover:border-primary-1"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPageChange(Math.min(meta.page + 1, meta.totalPages))}
              disabled={!meta.hasNextPage}
              className="h-8 rounded-lg border border-neutral-20 bg-white px-3 text-xs text-neutral-2 transition hover:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
