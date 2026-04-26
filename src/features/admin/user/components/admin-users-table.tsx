"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FiMail, FiMapPin, FiPhone, FiShield } from "react-icons/fi";
import { type AdminUser, type AdminUsersMeta } from "@/features/admin/user/servers";
import UserActionCell from "./admin-user-action-cell";

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

const getDisplayName = (user: AdminUser) => {
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  if (user.email && user.email.trim().length > 0) {
    return user.email.split("@")[0] || user.email;
  }

  return "Nguoi dung";
};

const getNameInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "ND";
  }

  return parts.map((item) => item.charAt(0).toUpperCase()).join("");
};

const getRoleLabel = (user: AdminUser) => {
  const roleName = user.role?.name;
  if (!roleName) {
    return "USER";
  }

  return roleName.toUpperCase();
};

const getRoleBadgeClass = (roleLabel: string) => {
  if (roleLabel.includes("ADMIN")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (roleLabel.includes("STAFF")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
};

const getAddressText = (user: AdminUser) => {
  const firstAddress = user.addresses?.[0];

  if (!firstAddress) {
    return "--";
  }

  const parts = [firstAddress.address, firstAddress.ward, firstAddress.province]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  return parts.length > 0 ? parts.join(", ") : "--";
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

interface AdminUsersTableProps {
  users: AdminUser[];
  meta: AdminUsersMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onUserUpdated?: (updatedUser: AdminUser) => void;
}

export default function AdminUsersTable({
  users,
  meta,
  isLoading,
  onPageChange,
  onLimitChange,
  onUserUpdated,
}: AdminUsersTableProps) {
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "user",
        header: "Người dùng",
        cell: ({ row }) => {
          const user = row.original;
          const displayName = getDisplayName(user);
          const initials = getNameInitials(displayName);
          const photoURL = user.photoURL?.trim();

          return (
            <div className="flex min-w-56 items-center gap-3 sm:min-w-62.5">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-20 bg-primary-5 text-xs font-semibold text-primary-1">
                {photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-1">{displayName}</p>
                <p className="truncate text-xs text-neutral-4">ID: {user.id}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: "Liên hệ",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="space-y-1 text-xs text-neutral-4 sm:text-sm">
              <p className="flex items-center gap-1.5 break-all">
                <FiMail size={13} />
                {user.email || "--"}
              </p>
              <p className="flex items-center gap-1.5">
                <FiPhone size={13} />
                {user.phoneNumber || "--"}
              </p>
            </div>
          );
        },
      },
      {
        id: "role",
        header: "Vai trò",
        cell: ({ row }) => {
          const roleLabel = getRoleLabel(row.original);

          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(roleLabel)}`}
            >
              <FiShield size={12} />
              {roleLabel}
            </span>
          );
        },
      },
      {
        id: "address",
        header: "Địa chỉ",
        cell: ({ row }) => (
          <p className="max-w-[320px] text-sm text-neutral-4">
            <span className="inline-flex items-start gap-1.5">
              <FiMapPin size={13} className="mt-0.5 shrink-0 text-neutral-4" />
              <span className="line-clamp-2">{getAddressText(row.original)}</span>
            </span>
          </p>
        ),
      },
      {
        id: "createdAt",
        header: "Tạo lúc",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-neutral-2">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => <UserActionCell user={row.original} onUserUpdated={onUserUpdated} />,
      },
    ],
    [onUserUpdated],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
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
    role: "right",
    createdAt: "right",
    actions: "right",
  };

  const columnResponsiveClass: Record<string, string> = {
    createdAt: "hidden lg:table-cell",
  };

  const displayPages = useMemo(
    () => buildPageList(meta.page, Math.max(meta.totalPages, 1)),
    [meta.page, meta.totalPages],
  );

  const hasRows = table.getRowModel().rows.length > 0;
  const startItem = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.totalItems);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-neutral-20 bg-white">
        <table className="w-full min-w-220 text-left text-sm">
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
                  Đang tải dữ liệu người dùng...
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
                  Chưa có người dùng nào.
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
          <span className="font-semibold text-neutral-1">{meta.totalItems}</span> người dùng
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
          <label htmlFor="admin-user-page-size" className="text-xs text-neutral-4">
            Số dòng/trang
          </label>
          <select
            id="admin-user-page-size"
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
