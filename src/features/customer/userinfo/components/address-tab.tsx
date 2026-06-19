"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import AddAddressModal from "./add-address-modal";
import { UserAddress } from "@/types/address";
import { useToast } from "@/hooks";
import { deleteAddress } from "../servers/address";
import { ConfirmDialog } from "@/components";

interface AddressTabProps {
  initialAddresses: UserAddress[];
}

export default function AddressTab({ initialAddresses }: AddressTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressIdToDelete, setAddressIdToDelete] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const handleAddressCreated = (newAddress: UserAddress) => {
    setAddresses((prev) => {
      if (newAddress.isDefault) {
        const normalized = prev.map((item) => ({ ...item, isDefault: false }));
        return [newAddress, ...normalized];
      }

      return [newAddress, ...prev];
    });
  };

  const handleAddressUpdated = (updatedAddress: UserAddress) => {
    setAddresses((prev) => {
      let next = prev.map((item) =>
        item._id === updatedAddress._id ? updatedAddress : item
      );
      if (updatedAddress.isDefault) {
        next = next.map((item) =>
          item._id === updatedAddress._id ? item : { ...item, isDefault: false }
        );
      }
      return next.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-neutral-1 sm:text-lg">Địa chỉ của tôi</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-1 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-2 sm:w-auto"
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
              className="relative flex flex-col gap-4 rounded-xl border border-neutral-20 p-4 sm:p-6"
            >
              <button
                type="button"
                onClick={() => {
                  setAddressIdToDelete(item._id);
                  setDeleteConfirmOpen(true);
                }}
                disabled={deletingId === item._id}
                aria-label="Xóa địa chỉ"
                className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-md border border-neutral-20 bg-white text-neutral-4 hover:bg-neutral-50 shadow-sm"
              >
                <FaTimes size={14} />
              </button>
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

                <p className="text-sm text-neutral-1 font-medium">{item.type}</p>
                <p className="text-sm text-neutral-1">
                  {item.address}, {item.ward}, {item.province}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                {!item.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(item._id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary-1 px-3 py-2 text-sm font-medium text-primary-1 transition-colors hover:bg-primary-6 sm:w-auto"
                    aria-label="Đặt làm mặc định"
                  >
                    Đặt mặc định
                  </button>
                ) : null}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(item);
                      setModalOpen(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-1 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-2 sm:w-auto"
                    aria-label="Chỉnh sửa địa chỉ"
                  >
                    <FaEdit size={14} className="inline-block align-middle" />
                    <span className="align-middle">Chỉnh sửa</span>
                  </button>

                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onCreated={handleAddressCreated}
        onUpdated={handleAddressUpdated}
        editAddress={editingAddress}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setAddressIdToDelete(null);
        }}
        onConfirm={async () => {
          if (!addressIdToDelete) return;
          setDeleteConfirmOpen(false);
          try {
            setDeletingId(addressIdToDelete);
            const res = await deleteAddress(addressIdToDelete);
            if (res.success) {
              setAddresses((prev) => prev.filter((a) => a._id !== addressIdToDelete));
              showSuccess(res.message || "Xóa địa chỉ thành công");
            } else {
              showError(res.message || "Không xóa được địa chỉ");
            }
          } catch {
            showError("Lỗi khi xóa địa chỉ");
          } finally {
            setDeletingId(null);
            setAddressIdToDelete(null);
          }
        }}
        title="Xóa địa chỉ"
        message="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        isDanger={true}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
