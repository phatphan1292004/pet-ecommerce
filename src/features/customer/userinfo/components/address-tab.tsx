"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import AddAddressModal from "./add-address-modal";

export default function AddressTab() {
  const [modalOpen, setModalOpen] = useState(false);

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

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-5">
        <FaMapMarkerAlt size={40} className="text-neutral-20" />
        <p className="text-sm">Bạn chưa có địa chỉ nào.</p>
      </div>

      <AddAddressModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
