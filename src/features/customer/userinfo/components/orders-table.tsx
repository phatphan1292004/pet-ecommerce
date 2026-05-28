"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Order, OrderItem } from "@/types/order";

const formatCurrency = (value?: number) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} đ` : "--";

const formatDate = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const normalizeStatus = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, "_").replace(/đ/g, "d");

const statusTokens = {
  pending: ["pending", "cho_xac_nhan", "dang_cho", "awaiting", "waiting"],
  delivering: ["delivering", "shipping", "dang_giao", "in_transit"],
  delivered: ["delivered", "da_giao", "completed", "done"],
  cancelled: ["cancelled", "canceled", "da_huy", "huy"],
};

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (statusTokens.pending.some((token) => normalized.includes(token))) {
    return "Chờ xác nhận";
  }
  if (statusTokens.delivering.some((token) => normalized.includes(token))) {
    return "Đang giao";
  }
  if (statusTokens.delivered.some((token) => normalized.includes(token))) {
    return "Đã giao";
  }
  if (statusTokens.cancelled.some((token) => normalized.includes(token))) {
    return "Đã hủy";
  }

  return status || "--";
};

const getStatusStyles = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (statusTokens.pending.some((token) => normalized.includes(token))) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (statusTokens.delivering.some((token) => normalized.includes(token))) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (statusTokens.delivered.some((token) => normalized.includes(token))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (statusTokens.cancelled.some((token) => normalized.includes(token))) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-neutral-20 bg-neutral-10 text-neutral-4";
};

const getPaymentLabel = (method?: string) => {
  if (!method) {
    return "--";
  }

  const normalized = method.toLowerCase();
  if (normalized === "cod") {
    return "COD";
  }
  if (normalized === "bank") {
    return "Chuyển khoản";
  }
  if (normalized === "vietqr") {
    return "VietQR";
  }
  if (normalized === "momo") {
    return "Momo";
  }
  if (normalized === "vnpay") {
    return "VNPAY";
  }
  if (normalized === "wallet") {
    return "Ví điện tử";
  }

  return method;
};

const getShortOrderId = (orderId?: string) => {
  if (!orderId) {
    return "--";
  }

  return orderId.length > 4 ? orderId.slice(-4) : orderId;
};

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "orderId",
        header: "Mã đơn",
        cell: ({ row }) => {
          const orderId = row.original._id || row.original.id || "";
          const shortId = getShortOrderId(orderId);
          return shortId === "--" ? (
            <span className="font-semibold text-neutral-1">--</span>
          ) : (
            <span className="font-semibold text-neutral-1">#{shortId}</span>
          );
        },
      },
      {
        id: "createdAt",
        header: "Ngày đặt",
        cell: ({ row }) => (
          <span className="text-neutral-4">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "recipient",
        header: "Người nhận",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-neutral-1">
              {row.original.arrivalName || "--"}
            </p>
            <p className="text-xs text-neutral-4">
              {row.original.arrivalPhone || "--"}
            </p>
          </div>
        ),
      },
      {
        id: "address",
        header: "Địa chỉ",
        cell: ({ row }) => (
          <span className="text-neutral-4">
            {row.original.arrivalAddress || "--"}
          </span>
        ),
      },
      {
        id: "payment",
        header: "Phương thức",
        cell: ({ row }) => (
          <span className="text-neutral-4">
            {getPaymentLabel(row.original.paymentMethod)}
          </span>
        ),
      },
      {
        id: "total",
        header: "Tổng",
        cell: ({ row }) => {
          const totalPrice =
            row.original.cart?.finalPrice ??
            row.original.finalPrice ??
            row.original.totalPrice;
          return (
            <span className="font-semibold text-neutral-1">
              {formatCurrency(totalPrice)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
              row.original.status,
            )}`}
          >
            {getStatusLabel(row.original.status)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const orderId = row.original._id || row.original.id || "";
          return (
            <a
              href={`/userinfo/orders/${orderId}`}
              className="inline-block min-w-26 text-sm text-primary-1 transition-colors hover:text-primary-2"
            >
              Xem chi tiết
            </a>
          );
        },
      },
    ],
    [],
  );

  const columnAlign: Record<string, "left" | "center" | "right"> = {
    items: "center",
    total: "right",
    status: "right",
    actions: "right",
  };

  const columnResponsiveClass: Record<string, string> = {
    address: "hidden xl:table-cell",
    payment: "hidden lg:table-cell",
    items: "hidden md:table-cell",
    createdAt: "hidden md:table-cell",
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-7">
      <table className="min-w-235 text-left text-sm">
        <thead className="bg-neutral-10 text-xs font-semibold uppercase text-neutral-4">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-4 py-3 ${
                    columnAlign[header.column.id] === "center"
                      ? "text-center"
                      : columnAlign[header.column.id] === "right"
                        ? "text-right"
                        : "text-left"
                  } ${columnResponsiveClass[header.column.id] ?? ""}`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-neutral-7 text-neutral-1">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="align-top">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-4 py-4 ${
                    columnAlign[cell.column.id] === "center"
                      ? "text-center"
                      : columnAlign[cell.column.id] === "right"
                        ? "text-right"
                        : "text-left"
                  } ${columnResponsiveClass[cell.column.id] ?? ""}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
