"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiEye,
  FiLoader,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import {
  getShortOrderId,
  normalizeOrderStatus,
} from "@/features/admin/order/utils";
import {
  deleteAdminOrder,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/features/admin/order/servers";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đã xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

interface AdminOrderActionCellProps {
  order: AdminOrder;
  onOrderDeleted?: (orderId: string) => void;
  onOrderUpdated?: (updatedOrder: AdminOrder) => void;
}

export default function AdminOrderActionCell({
  order,
  onOrderDeleted,
  onOrderUpdated,
}: AdminOrderActionCellProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string>("");
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const actionContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isStatusMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (actionContainerRef.current?.contains(target)) {
        return;
      }

      setIsStatusMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusMenuOpen]);

  const handleDelete = () => {
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${getShortOrderId(order._id, "--")}?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteAdminOrder(order._id);
      if (result.success) {
        onOrderDeleted?.(order._id);
      } else {
        setDeleteError(result.message || "Xóa đơn hàng thất bại");
        setTimeout(() => setDeleteError(""), 3000);
      }
    });
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (isUpdatingStatus || isDeleting) {
      return;
    }

    const currentStatus = normalizeOrderStatus(order.status);
    if (currentStatus === nextStatus) {
      setIsStatusMenuOpen(false);
      return;
    }

    setStatusError("");
    setIsUpdatingStatus(true);

    const result = await updateAdminOrderStatus(order._id, { status: nextStatus });

    if (result.success) {
      const updatedOrder = result.data ? result.data : { ...order, status: nextStatus };
      onOrderUpdated?.(updatedOrder);
      setIsStatusMenuOpen(false);
    } else {
      setStatusError(result.message || "Cập nhật trạng thái thất bại");
    }

    setIsUpdatingStatus(false);
  };

  return (
    <div className="min-w-24 text-right sm:min-w-51.25" ref={actionContainerRef}>
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
          disabled={isDeleting || isUpdatingStatus}
          title={deleteError || "Xóa đơn hàng"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? <FiLoader className="animate-spin" size={13} /> : <FiTrash2 size={13} />}
          {isDeleting ? "Đang xóa" : ""}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStatusMenuOpen((prev) => !prev)}
            disabled={isUpdatingStatus || isDeleting}
            className="inline-flex items-center rounded-lg border border-neutral-20 bg-white px-2.5 py-2.5 text-neutral-4 transition hover:border-primary-4 hover:text-neutral-2 disabled:cursor-not-allowed disabled:opacity-60"
            title="Tùy chọn"
            aria-label="Tùy chọn"
            aria-haspopup="menu"
            aria-expanded={isStatusMenuOpen}
          >
            {isUpdatingStatus ? <FiLoader className="animate-spin" size={13} /> : <FiMoreVertical size={13} />}
          </button>

          {isStatusMenuOpen ? (
            <div
              className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-neutral-20 bg-white p-1 shadow-lg"
              role="menu"
              aria-label="Chuyển trạng thái đơn hàng"
            >
              <p className="px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-4">
                Trạng thái đơn
              </p>
              {STATUS_OPTIONS.map((option) => {
                const isCurrent = normalizeOrderStatus(order.status) === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    onClick={() => void handleStatusChange(option.value)}
                    disabled={isUpdatingStatus || isCurrent || isDeleting}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition ${
                      isCurrent
                        ? "bg-neutral-10 text-neutral-3"
                        : "text-neutral-2 hover:bg-primary-6 hover:text-primary-1"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                    title={isCurrent ? "Đang ở trạng thái này" : `Chuyển sang ${option.label}`}
                  >
                    <span>{option.label}</span>
                    {isCurrent ? <FiCheck size={13} className="text-emerald-600" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {deleteError || statusError ? (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-600">
          <FiAlertTriangle size={12} />
          {deleteError || statusError}
        </p>
      ) : null}
    </div>
  );
}