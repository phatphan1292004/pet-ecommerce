"use client";

import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiRotateCcw, FiSearch } from "react-icons/fi";
import AdminOrdersTable from "@/features/admin/order/components/admin-orders-table";
import {
  getAdminOrders,
  type AdminOrder,
  type AdminOrdersMeta,
} from "@/features/admin/order/servers";

interface OrderManagementPageProps {
  initialOrders: AdminOrder[];
  initialMeta: AdminOrdersMeta;
}

export default function OrderManagementPage({
  initialOrders,
  initialMeta,
}: OrderManagementPageProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [meta, setMeta] = useState<AdminOrdersMeta>(initialMeta);
  const [page, setPage] = useState(initialMeta.page);
  const [limit, setLimit] = useState(initialMeta.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Không fetch lại nếu vẫn ở trang đầu tiên với limit mặc định
    if (
      page === initialMeta.page &&
      limit === initialMeta.limit &&
      keyword.length === 0 &&
      statusFilter === "all"
    ) {
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getAdminOrders({
        page,
        limit,
        keyword: keyword || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setOrders([]);
        setMeta({
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
        setErrorMessage(result.message || "Không thể tải danh sách đơn hàng");
        setIsLoading(false);
        return;
      }

      setOrders(result.data.items);
      setMeta(result.data.meta);
      setIsLoading(false);
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [page, limit, keyword, statusFilter, initialMeta.page, initialMeta.limit]);

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setStatusFilter(statusInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setStatusInput("all");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters = keyword.length > 0 || statusFilter !== "all";

  const titleDescription = useMemo(
    () =>
      `Theo dõi đơn hàng theo thời gian thực, trang ${meta.page}/${Math.max(meta.totalPages, 1)}`,
    [meta.page, meta.totalPages]
  );

  const handleOrderDeleted = (deletedOrderId: string) => {
    setOrders((prev) => prev.filter((order) => order._id !== deletedOrderId));
  };

  const handleOrderUpdated = (updatedOrder: AdminOrder) => {
    setOrders((prev) =>
      prev.map((order) => (order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order))
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-black sm:text-lg">Quản lý đơn hàng</h2>
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
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại"
            className="h-10 w-full rounded-lg border border-neutral-20 bg-white pl-9 pr-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
          />
        </label>

        <select
          value={statusInput}
          onChange={(event) => setStatusInput(event.target.value)}
          className="h-10 rounded-lg border border-neutral-20 bg-white px-3 text-sm text-neutral-2 outline-none focus:border-primary-1"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="processing">Đã xác nhận</option>
          <option value="delivering">Đang giao</option>
          <option value="delivered">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
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
            disabled={!hasActiveFilters && keywordInput.length === 0 && statusInput === "all"}
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
          {statusFilter !== "all" ? (
            <>
              {" "}
              · Trạng thái <span className="font-semibold text-neutral-2">{statusFilter}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <AdminOrdersTable
        orders={orders}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        onOrderDeleted={handleOrderDeleted}
        onOrderUpdated={handleOrderUpdated}
      />
    </section>
  );
}
