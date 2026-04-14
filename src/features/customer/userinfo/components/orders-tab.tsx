"use client";

import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { getOrdersByCustomer } from "@/features/customer/userinfo/servers";
import type { Order } from "@/types/order";
import OrdersTable from "@/features/customer/userinfo/components/orders-table";

type OrderFilterKey = "all" | "pending" | "delivering" | "delivered" | "cancelled";

const TABS: Array<{ label: string; key: OrderFilterKey }> = [
  { label: "Tất cả", key: "all" },
  { label: "Chờ xác nhận", key: "pending" },
  { label: "Đang giao", key: "delivering" },
  { label: "Đã giao", key: "delivered" },
  { label: "Đã hủy", key: "cancelled" },
];

const statusQueryMap: Record<OrderFilterKey, string | undefined> = {
  all: undefined,
  pending: "pending",
  delivering: "delivering",
  delivered: "delivered",
  cancelled: "cancelled",
};

export default function OrdersTab() {
  const [selectedTab, setSelectedTab] = useState<OrderFilterKey>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getOrdersByCustomer({
        status: statusQueryMap[selectedTab],
      });
      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setErrorMessage(result.message || "Không thể tải danh sách đơn hàng");
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setOrders(result.data || []);
      setIsLoading(false);
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [selectedTab]);

  const filteredOrders = useMemo(() => orders, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-semibold text-neutral-1 sm:text-lg">Đơn hàng của tôi</h3>

      <div className="overflow-x-auto border-b border-neutral-20">
        <div className="flex min-w-max gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`-mb-px border-b-2 px-3 pb-2 text-sm font-medium whitespace-nowrap transition-colors sm:text-base ${
                selectedTab === tab.key
                  ? "border-primary-1 text-primary-1"
                  : "border-transparent text-neutral-4 hover:text-primary-1"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-neutral-7 bg-neutral-10 px-6 py-10 text-center text-sm text-neutral-4">
          Đang tải danh sách đơn hàng...
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          {errorMessage}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-5">
          <FaBoxOpen size={48} className="text-neutral-20" />
          <p className="text-base">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
}
