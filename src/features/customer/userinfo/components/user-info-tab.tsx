"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaCamera, FaRegUserCircle } from "react-icons/fa";
import { Field, Input, Label } from "@headlessui/react";
import { UserInfo } from "@/types/user";
import { useToast } from "@/hooks";
import { changeInfo } from "../servers/info";
import { uploadAvatarToCloudinary } from "@/integrations/cloudinary";

export default function UserInfoTab({ userInfo }: { userInfo: UserInfo }) {
  const { showSuccess, showError } = useToast();
  const avatarFromProfile = useMemo(
    () => userInfo?.photoURL || userInfo?.avatar || userInfo?.avatarUrl || userInfo?.profileImage || "",
    [userInfo]
  );
  const [avatarUrl, setAvatarUrl] = useState(avatarFromProfile);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(avatarFromProfile);
  const [formData, setFormData] = useState({
    displayName: userInfo?.displayName || "",
    birthDate: (userInfo?.birthDate || userInfo?.dateOfBirth || "").slice(0, 10),
    phoneNumber: userInfo?.phoneNumber || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedAvatarFile) {
      setAvatarPreviewUrl(avatarUrl);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedAvatarFile);
    setAvatarPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedAvatarFile, avatarUrl]);

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
      let uploadedAvatarUrl = avatarUrl;

      if (selectedAvatarFile) {
        uploadedAvatarUrl = await uploadAvatarToCloudinary(selectedAvatarFile);
      }

      const response = await changeInfo({
        ...formData,
        photoURL: uploadedAvatarUrl,
      });

      if (response.success) {
        setAvatarUrl(uploadedAvatarUrl);
        setSelectedAvatarFile(null);
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

  const handleSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Vui long chon file anh hop le");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showError("Anh dai dien phai nho hon 3MB");
      event.target.value = "";
      return;
    }

    setSelectedAvatarFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar + Points + Edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full border-2 border-neutral-20 flex items-center justify-center bg-white overflow-hidden">
              {avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FaRegUserCircle size={52} className="text-neutral-5" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-1 text-white flex items-center justify-center hover:bg-primary-2 transition-colors"
              aria-label="Chon avatar"
            >
              <FaCamera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSelectAvatar}
              className="hidden"
            />
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
            value={formData.birthDate}
            onChange={(e) => handleChange("birthDate", e.target.value)}
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
