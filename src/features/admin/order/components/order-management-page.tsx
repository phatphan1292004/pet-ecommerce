"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    // Không fetch lại nếu vẫn ở trang đầu tiên với limit mặc định
    if (page === initialMeta.page && limit === initialMeta.limit) {
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getAdminOrders({ page, limit });

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
  }, [page, limit, initialMeta.page, initialMeta.limit]);

  const titleDescription = useMemo(
    () =>
      `Theo dõi đơn hàng theo thời gian thực, trang ${meta.page}/${Math.max(meta.totalPages, 1)}`,
    [meta.page, meta.totalPages]
  );

  const handleOrderDeleted = (deletedOrderId: string) => {
    setOrders((prev) => prev.filter((order) => order._id !== deletedOrderId));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-black">Quản lý đơn hàng</h2>
          <p className="text-sm text-neutral-4">{titleDescription}</p>
        </div>
      </div>

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
      />
    </section>
  );
}
