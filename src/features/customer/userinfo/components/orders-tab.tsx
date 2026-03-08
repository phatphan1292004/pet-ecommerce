"use client";

import { FaBoxOpen } from "react-icons/fa";

const TABS = ["Tất cả", "Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy"];

export default function OrdersTab() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-semibold text-neutral-1">Đơn hàng của tôi</h3>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-neutral-20">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`pb-2 px-3 text-base font-medium transition-colors border-b-2 -mb-px ${
              i === 0
                ? "border-primary-1 text-primary-1"
                : "border-transparent text-neutral-4 hover:text-primary-1"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-5">
        <FaBoxOpen size={48} className="text-neutral-20" />
        <p className="text-base">Bạn chưa có đơn hàng nào.</p>
      </div>
    </div>
  );
}
