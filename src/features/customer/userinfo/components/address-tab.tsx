"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import AddAddressModal from "./add-address-modal";
import { UserAddress } from "@/types/address";

interface AddressTabProps {
  initialAddresses: UserAddress[];
}

export default function AddressTab({ initialAddresses }: AddressTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);

  const handleAddressCreated = (newAddress: UserAddress) => {
    setAddresses((prev) => {
      if (newAddress.isDefault) {
        const normalized = prev.map((item) => ({ ...item, isDefault: false }));
        return [newAddress, ...normalized];
      }

      return [newAddress, ...prev];
    });
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item._id === addressId,
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-1">Địa chỉ của tôi</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary-1 hover:bg-primary-2 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <FaPlus size={12} />
          Thêm địa chỉ
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-5">
          <FaMapMarkerAlt size={40} className="text-neutral-20" />
          <p className="text-sm">Bạn chưa có địa chỉ nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-neutral-20 p-6 flex flex-col gap-4"
            >
              <div className="space-y-2 text-neutral-2">
                <div className="flex items-center gap-2 text-sm text-neutral-3">
                  {item.isDefault ? (
                    <span className="rounded border border-amber-500 px-2 py-0.5 text-amber-600 font-medium">
                      Mặc định
                    </span>
                  ) : null}
                  <span className="font-semibold text-neutral-1">{item.fullName}</span>
                  <span>|</span>
                  <span>{item.phone}</span>
                </div>

                <p className="text-sm text-neutral-3 font-medium">{item.type}</p>
                <p className="text-sm">
                  {item.address}, {item.ward}, {item.province}
                </p>
              </div>

              <div className="self-end flex items-center gap-2">
                {!item.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(item._id)}
                    className="rounded-md border border-primary-1 px-4 py-2 text-sm font-medium text-primary-1 hover:bg-primary-6 transition-colors"
                  >
                    Set làm địa chỉ mặc định
                  </button>
                ) : null}

                <button
                  type="button"
                  className="rounded-md bg-primary-1 px-5 py-2 text-sm font-medium text-white hover:bg-primary-2 transition-colors"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleAddressCreated}
      />
    </div>
  );
}
