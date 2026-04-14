"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (page === initialMeta.page && limit === initialMeta.limit) {
      return;
    }

    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setFetchError("");

      const result = await getAdminUsers({ page, limit });

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
  }, [page, limit, initialMeta.page, initialMeta.limit]);

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
