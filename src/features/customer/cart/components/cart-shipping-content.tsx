"use client";

import { useState } from "react";
import { AddAddressModal } from "@/features/customer/userinfo/components";
import { useCartStore } from "@/store";

const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const WARDS = ["Phường 1", "Phường 2", "Phường 3", "Xã An Phú", "Xã Bình Chánh"];

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function CartShippingContent() {
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [form, setForm] = useState({
    savedAddress: "",
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    address: "",
    note: "",
  });

  const shippingFee = 0;
  const grandTotal = totalPrice + shippingFee;

  const set = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <p className="text-base font-semibold text-primary-1">Thông tin người nhận</p>

          <select
            value={form.savedAddress}
            onChange={(e) => set("savedAddress", e.target.value)}
            className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-4 outline-none focus:border-primary-3 transition-colors"
          >
            <option value="">Chọn địa chỉ đã lưu</option>
          </select>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
          </div>

          <p className="text-base font-semibold text-primary-1">Địa chỉ</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-4 outline-none focus:border-primary-3 transition-colors"
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select
              value={form.ward}
              onChange={(e) => set("ward", e.target.value)}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-4 outline-none focus:border-primary-3 transition-colors"
            >
              <option value="">Chọn phường/xã</option>
              {WARDS.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
          />

          <textarea
            placeholder="Ghi chú"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            className="h-28 w-full resize-none rounded-lg border border-neutral-20 px-4 py-3 text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
          />

          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-primary-1 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-2">
              Lưu
            </button>
            <button
              onClick={() => setOpenAddressModal(true)}
              className="rounded-lg bg-primary-1 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-2"
            >
              Thêm địa chỉ mới
            </button>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-7 p-5">
          <div className="space-y-3 border-b border-neutral-7 pb-4 text-neutral-2">
            <div className="flex items-center justify-between">
              <span>Tiền sản phẩm</span>
              <span className="font-semibold">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phí vận chuyển</span>
              <span className="font-semibold">{formatCurrency(shippingFee)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-lg font-bold text-neutral-1">
            <span>Tổng cộng</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <button className="mt-6 w-full rounded-xl bg-neutral-7 py-3 font-semibold text-white" disabled>
            Thanh toán
          </button>
        </aside>
      </div>

      <AddAddressModal open={openAddressModal} onClose={() => setOpenAddressModal(false)} />
    </>
  );
}
