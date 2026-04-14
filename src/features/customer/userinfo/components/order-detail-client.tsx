"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaEdit, FaSave, FaTimes, FaCreditCard, FaMoneyBillWave, FaTruck } from "react-icons/fa";
import type { Order, OrderItem } from "@/types/order";
import { updateOrderDeliveryInfo } from "../servers/orders";
import { useToast } from "@/hooks";

interface OrderDetailClientProps {
  order: Order;
  orderId: string;
}

const formatCurrency = (v?: number) =>
  typeof v === "number" ? `${v.toLocaleString("vi-VN")} đ` : "--";

const getItems = (order: Order): OrderItem[] =>
  order.cart?.products || order.products || order.items || order.cartItems || [];

export default function OrderDetailClient({ order: initialOrder, orderId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useToast();

  const [form, setForm] = useState({
    arrivalName: initialOrder.arrivalName || "",
    arrivalPhone: initialOrder.arrivalPhone || "",
    arrivalAddress: initialOrder.arrivalAddress || "",
  });

  const items = useMemo(() => getItems(order), [order]);

  const resetForm = () => {
    setForm({
      arrivalName: order.arrivalName || "",
      arrivalPhone: order.arrivalPhone || "",
      arrivalAddress: order.arrivalAddress || "",
    });
  };

  const handleSave = async () => {
    if (!form.arrivalName.trim() || !form.arrivalPhone.trim() || !form.arrivalAddress.trim()) {
      showError("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateOrderDeliveryInfo(orderId, {
        arrivalName: form.arrivalName.trim(),
        arrivalPhone: form.arrivalPhone.trim(),
        arrivalAddress: form.arrivalAddress.trim(),
      });

      if (!res.success) {
        showError(res.message || "Không thể cập nhật đơn hàng");
        return;
      }

      const nextOrder = res.data || {
        ...order,
        arrivalName: form.arrivalName.trim(),
        arrivalPhone: form.arrivalPhone.trim(),
        arrivalAddress: form.arrivalAddress.trim(),
      };

      setOrder(nextOrder);
      setIsEditing(false);
      showSuccess(res.message || "Cập nhật thành công");
    } catch {
      showError("Không thể cập nhật đơn hàng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-4 sm:text-sm">
        <Link href="/" className="hover:text-neutral-1">
          Trang chủ
        </Link>
        <span className="text-neutral-5">/</span>
        <Link href="/userinfo" className="hover:text-neutral-1">
          Tài khoản
        </Link>
        <span className="text-neutral-5">/</span>
        <span className="text-neutral-1">Chi tiết đơn hàng</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/userinfo"
            className="inline-flex items-center gap-2 text-sm text-neutral-4 hover:text-neutral-1"
          >
            <FaArrowLeft size={12} />
            Quay lại
          </Link>
          <h1 className="text-lg font-semibold text-neutral-1 sm:text-2xl">
            Chi tiết đơn hàng #{orderId.slice(-6)}
          </h1>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-20 bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral-4">Người nhận</p>
              {isEditing ? (
                <input
                  value={form.arrivalName}
                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalName: e.target.value }))}
                  className="w-full rounded-md border border-neutral-20 px-3 py-2 text-sm text-neutral-1"
                />
              ) : (
                <p className="font-medium text-neutral-1">{order.arrivalName || "--"}</p>
              )}
              {isEditing ? (
                <input
                  value={form.arrivalPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalPhone: e.target.value }))}
                  className="w-full rounded-md border border-neutral-20 px-3 py-2 text-sm text-neutral-1"
                />
              ) : (
                <p className="text-sm text-neutral-4">{order.arrivalPhone || "--"}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral-4">Địa chỉ</p>
              {isEditing ? (
                <textarea
                  value={form.arrivalAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalAddress: e.target.value }))}
                  className="w-full rounded-md border border-neutral-20 px-3 py-2 text-sm text-neutral-1"
                  rows={3}
                />
              ) : (
                <p className="font-medium text-neutral-1">{order.arrivalAddress || "--"}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  resetForm();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-1 px-3 py-2 text-sm font-medium text-white hover:bg-primary-2"
              >
                <FaEdit size={14} />
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-1 px-3 py-2 text-sm font-medium text-white hover:bg-primary-2 disabled:bg-neutral-5"
                >
                  <FaSave size={14} />
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-20 px-3 py-2 text-sm font-medium text-neutral-3 hover:bg-neutral-10"
                >
                  <FaTimes size={14} />
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-20 p-4">
            <div className="flex items-center gap-2 text-neutral-4">
              <FaCreditCard size={14} />
              <p className="text-xs uppercase tracking-wide">Phương thức</p>
            </div>
            <p className="mt-2 font-medium text-neutral-1">{order.paymentMethod || "--"}</p>
          </div>
          <div className="rounded-xl border border-neutral-20 p-4">
            <div className="flex items-center gap-2 text-neutral-4">
              <FaMoneyBillWave size={14} />
              <p className="text-xs uppercase tracking-wide">Tổng</p>
            </div>
            <p className="mt-2 font-semibold text-neutral-1">
              {formatCurrency(order.totalPrice || order.finalPrice)}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-20 p-4">
            <div className="flex items-center gap-2 text-neutral-4">
              <FaTruck size={14} />
              <p className="text-xs uppercase tracking-wide">Trạng thái</p>
            </div>
            <p className="mt-2 font-medium text-neutral-1">{order.status || "--"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-20 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-1 mb-4">Sản phẩm</h2>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-4">Không có sản phẩm.</p>
          ) : (
            items.map((it, i) => (
              <div
                key={it.productId || it._id || i}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-20 bg-neutral-10">
                    {it.image ? (
                      <Image src={it.image} alt={it.name || "Sản phẩm"} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-1">{it.name || "Sản phẩm"}</p>
                    <p className="text-xs text-neutral-4">SL: {it.quantity || 0}</p>
                  </div>
                </div>
                <div className="text-left text-sm font-semibold text-neutral-1 sm:text-right">
                  {formatCurrency((Number(it.price) || 0) * (Number(it.quantity) || 0))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
