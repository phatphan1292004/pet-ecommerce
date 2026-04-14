"use client";

import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiRotateCcw, FiSearch } from "react-icons/fi";
import AdminUsersTable from "./admin-users-table";
import {
  getAdminUsers,
  type AdminUser,
  type AdminUsersMeta,
} from "@/features/admin/user/servers";

interface AdminUsersPageProps {
  initialUsers: AdminUser[];
  initialMeta: AdminUsersMeta;
  errorMessage?: string;
}

export default function AdminUsersPage({
  initialUsers,
  initialMeta,
  errorMessage = "",
}: AdminUsersPageProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [meta, setMeta] = useState<AdminUsersMeta>(initialMeta);
  const [page, setPage] = useState(initialMeta.page);
  const [limit, setLimit] = useState(initialMeta.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(errorMessage);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleInput, setRoleInput] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    if (
      page === initialMeta.page &&
      limit === initialMeta.limit &&
      keyword.length === 0 &&
      roleFilter === "all"
    ) {
      return;
    }

    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setFetchError("");

      const result = await getAdminUsers({
        page,
        limit,
        keyword: keyword || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setUsers([]);
        setMeta({
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
        setFetchError(result.message || "Khong the tai danh sach nguoi dung");
        setIsLoading(false);
        return;
      }

      setUsers(result.data.items);
      setMeta(result.data.meta);
      setIsLoading(false);
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [page, limit, keyword, roleFilter, initialMeta.page, initialMeta.limit]);

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setRoleFilter(roleInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setRoleInput("all");
    setRoleFilter("all");
    setPage(1);
  };

  const hasActiveFilters = keyword.length > 0 || roleFilter !== "all";

  const titleDescription = useMemo(
    () =>
      `Tong ${meta.totalItems.toLocaleString("vi-VN")} nguoi dung · Trang ${meta.page}/${Math.max(meta.totalPages, 1)}`,
    [meta.totalItems, meta.page, meta.totalPages]
  );

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Quản lý người dùng</h2>
          <p className="text-xs text-neutral-4 sm:text-sm">{titleDescription}</p>
        </div>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="grid gap-3 rounded-2xl border border-neutral-20 bg-neutral-10 p-3 md:grid-cols-[minmax(0,1fr),220px,auto]"
      >
        <label className="relative block">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-4"
          />
          <input
            type="text"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <select
          value={roleInput}
          onChange={(event) => setRoleInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="USER">USER</option>
          <option value="STAFF">STAFF</option>
          <option value="ADMIN">ADMIN</option>
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
            onClick={handleResetFilters}
            disabled={!hasActiveFilters && keywordInput.length === 0 && roleInput === "all"}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-20 bg-white px-3 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRotateCcw size={15} />
            Đặt lại
          </button>
        </div>
      </form>

      {hasActiveFilters ? (
        <p className="text-xs text-neutral-4">
          Đang lọc: <span className="font-semibold text-neutral-2">{keyword || "--"}</span>
          {roleFilter !== "all" ? (
            <>
              {" "}
              · Vai trò <span className="font-semibold text-neutral-2">{roleFilter}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {fetchError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {fetchError}
        </div>
      ) : null}

      <AdminUsersTable
        users={users}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(nextLimit: number) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </section>
  );
}
