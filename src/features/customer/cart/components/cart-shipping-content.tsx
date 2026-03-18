"use client";

import { useEffect, useState } from "react";
import { AddAddressModal } from "@/features/customer/userinfo/components";
import { useCartStore } from "@/store";
import { getProvinces, getWardsByProvinceId } from "../../userinfo/servers";
import { LocationOption } from "../../userinfo/servers/location";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function CartShippingContent() {
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await getProvinces();
        if (isMounted) {
          setProvinces(data);
        }
      } catch {
        if (isMounted) {
          setProvinces([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    void fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!selectedProvinceId) {
      setWards([]);
      return () => {
        isMounted = false;
      };
    }

    const fetchWards = async () => {
      setIsLoadingWards(true);
      try {
        const data = await getWardsByProvinceId(selectedProvinceId);
        if (isMounted) {
          setWards(data);
        }
      } catch {
        if (isMounted) {
          setWards([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingWards(false);
        }
      }
    };

    void fetchWards();

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId]);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    const selectedProvince = provinces.find((province) => province.id === provinceId);
    set("province", selectedProvince?.name ?? "");
    set("ward", "");
  };

  const handleWardChange = (wardId: string) => {
    const selectedWard = wards.find((ward) => ward.id === wardId);
    set("ward", selectedWard?.name ?? "");
  };

  const selectedWardId = wards.find((ward) => ward.name === form.ward)?.id ?? "";

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
              value={selectedProvinceId}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-4 outline-none focus:border-primary-3 transition-colors"
            >
              <option value="" disabled>
                {isLoadingProvinces ? "Đang tải tỉnh/thành phố..." : "Chọn tỉnh/thành phố"}
              </option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
            <select
              value={selectedWardId}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!selectedProvinceId || isLoadingWards}
              className="w-full rounded-lg border border-neutral-20 px-4 py-3 text-neutral-4 outline-none focus:border-primary-3 transition-colors"
            >
              <option value="" disabled>
                {!selectedProvinceId
                  ? "Chọn tỉnh/thành phố trước"
                  : isLoadingWards
                    ? "Đang tải phường/xã..."
                    : "Chọn phường/xã"}
              </option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
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
