"use client";

import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
}

const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const WARDS = ["Phường 1", "Phường 2", "Phường 3", "Xã An Phú", "Xã Bình Chánh"];
const ADDRESS_TYPES = ["Nhà riêng", "Văn phòng", "Khác"];

export default function AddAddressModal({ open, onClose }: AddAddressModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    ward: "",
    address: "",
    type: "",
    isDefault: false,
  });

  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="bg-white rounded-2xl w-200 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="relative flex items-center justify-center py-5 px-6 border-b border-neutral-20">
          <h2 className="text-2xl font-bold text-neutral-1">Thêm địa chỉ</h2>
          <button
            onClick={onClose}
            className="absolute right-5 text-neutral-4 hover:text-neutral-1 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-5">
          <p className="text-sm text-neutral-4">
            Vui lòng lựa chọn địa chỉ giao hàng. Thông tin giao hàng có thể thay đổi tại phần Cài đặt.
          </p>

          <p className="text-base font-semibold text-primary-1">Thông tin cá nhân</p>

          {/* Họ tên */}
          <input
            type="text"
            placeholder="Họ tên"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
          />

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
          </div>

          {/* Province + Ward */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              className="border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
            >
              <option value="" disabled>Tỉnh, thành phố</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={form.ward}
              onChange={(e) => set("ward", e.target.value)}
              className="border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
            >
              <option value="" disabled>Phường, xã</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <input
            type="text"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
          />

          {/* Type */}
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
          >
            <option value="" disabled>Loại địa chỉ</option>
            {ADDRESS_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Default checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="w-5 h-5 accent-primary-1 cursor-pointer"
            />
            <span className="text-base text-neutral-3">Đặt làm địa chỉ mặc định</span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={onClose}
              className="px-10 py-2.5 rounded-lg border border-neutral-20 text-base font-semibold text-neutral-3 hover:bg-neutral-10 transition-colors"
            >
              Hủy bỏ
            </button>
            <button className="px-10 py-2.5 rounded-lg bg-primary-1 hover:bg-primary-2 text-white text-base font-semibold transition-colors">
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
