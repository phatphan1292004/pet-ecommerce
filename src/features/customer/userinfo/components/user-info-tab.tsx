"use client";

import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { Field, Input, Label } from "@headlessui/react";
import { UserInfo } from "@/types/user";
import { useToast } from "@/hooks";
import { changeInfo } from "../servers/info";

export default function UserInfoTab({ userInfo }: { userInfo: UserInfo }) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    displayName: userInfo?.displayName || "",
    dateOfBirth: "",
    phoneNumber: userInfo?.phoneNumber || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await changeInfo(formData);

      if (response.success) {
        showSuccess(response.message);
      } else {
        showError(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar + Points + Edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full border-2 border-neutral-20 flex items-center justify-center bg-white">
            <FaRegUserCircle size={52} className="text-neutral-5" />
          </div>
          <span className="text-neutral-4 text-base">0 điểm</span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-5 text-white font-semibold text-base px-6 py-2 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang lưu..." : "Chỉnh sửa"}
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* Họ và tên */}
        <Field>
          <Label className="text-base text-neutral-3">Họ và tên</Label>
          <Input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none focus:bg-white focus:ring-2 focus:ring-primary-4 transition-colors"
          />
        </Field>

        {/* Sinh nhật */}
        <Field>
          <Label className="text-base text-neutral-3">Sinh nhật</Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary-4 transition-colors"
          />
        </Field>

        {/* Email - Disabled */}
        <Field disabled>
          <Label className="text-base text-neutral-3 data-disabled:text-neutral-3">Email</Label>
          <Input
            type="email"
            value={userInfo?.email || ""}
            className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none cursor-not-allowed data-disabled:opacity-60 data-disabled:cursor-not-allowed"
          />
        </Field>

        {/* Số điện thoại */}
        <Field>
          <Label className="text-base text-neutral-3">Số điện thoại</Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none focus:bg-white focus:ring-2 focus:ring-primary-4 transition-colors"
          />
        </Field>
      </div>

      {/* Delete Account */}
      <div className="pt-2">
        <button
          type="button"
          className="border border-primary-1 text-primary-1 hover:bg-primary-6 text-base font-medium px-5 py-2 rounded-md transition-colors"
        >
          Xóa tài khoản
        </button>
      </div>
    </form>
  );
}
