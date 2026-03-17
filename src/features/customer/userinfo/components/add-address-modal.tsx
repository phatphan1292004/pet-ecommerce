"use client";

import {
  Button,
  Checkbox,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
  Select,
} from "@headlessui/react";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
}

const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const WARDS = ["Phường 1", "Phường 2", "Phường 3", "Xã An Phú", "Xã Bình Chánh"];
const ADDRESS_TYPES = ["Nhà riêng", "Văn phòng", "Khác"];

type AddressForm = {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  ward: string;
  address: string;
  type: string;
  isDefault: boolean;
};

export default function AddAddressModal({ open, onClose }: AddAddressModalProps) {
  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    ward: "",
    address: "",
    type: "",
    isDefault: false,
  });

  const set = <K extends keyof AddressForm>(field: K, value: AddressForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center px-4">
        <DialogPanel className="bg-white rounded-2xl w-200 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="relative flex items-center justify-center py-5 px-6 border-b border-neutral-20">
          <DialogTitle className="text-2xl font-bold text-neutral-1">Thêm địa chỉ</DialogTitle>
          <Button
            onClick={onClose}
            className="absolute right-5 text-neutral-4 hover:text-neutral-1 transition-colors"
          >
            <FaTimes size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-5">
          <Description className="text-sm text-neutral-4">
            Vui lòng lựa chọn địa chỉ giao hàng. Thông tin giao hàng có thể thay đổi tại phần Cài đặt.
          </Description>

          <p className="text-base font-semibold text-primary-1">Thông tin cá nhân</p>

          {/* Họ tên */}
          <Field>
            <Input
              type="text"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
          </Field>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Input
                type="tel"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
              />
            </Field>
            <Field>
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
              />
            </Field>
          </div>

          {/* Province + Ward */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Tỉnh, thành phố</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                value={form.ward}
                onChange={(e) => set("ward", e.target.value)}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Phường, xã</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Address */}
          <Field>
            <Input
              type="text"
              placeholder="Địa chỉ"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
            />
          </Field>

          {/* Type */}
          <Field>
            <Select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
            >
              <option value="" disabled>Loại địa chỉ</option>
              {ADDRESS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>

          {/* Default checkbox */}
          <Field className="flex items-center gap-3 cursor-pointer select-none">
            <Checkbox
              checked={form.isDefault}
              onChange={(checked) => set("isDefault", checked)}
              className="group flex size-5 items-center justify-center rounded border border-neutral-20 bg-white data-checked:bg-primary-1 data-checked:border-primary-1"
            >
              <span className="text-sm font-bold text-white opacity-0 transition-opacity group-data-checked:opacity-100">
                ✓
              </span>
            </Checkbox>
            <Label className="text-base text-neutral-3">Đặt làm địa chỉ mặc định</Label>
          </Field>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              onClick={onClose}
              className="px-10 py-2.5 rounded-lg border border-neutral-20 text-base font-semibold text-neutral-3 hover:bg-neutral-10 transition-colors"
            >
              Hủy bỏ
            </Button>
            <Button className="px-10 py-2.5 rounded-lg bg-primary-1 hover:bg-primary-2 text-white text-base font-semibold transition-colors">
              Xác nhận
            </Button>
          </div>
        </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
