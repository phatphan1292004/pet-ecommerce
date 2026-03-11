"use client";

import { FaRegUserCircle } from "react-icons/fa";
import { UserInfo } from "@/types/user";

export default function UserInfoTab({ userInfo }: { userInfo: UserInfo }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + Points + Edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full border-2 border-neutral-20 flex items-center justify-center bg-white">
            <FaRegUserCircle size={52} className="text-neutral-5" />
          </div>
          <span className="text-neutral-4 text-base">0 điểm</span>
        </div>
        <button className="bg-primary-1 hover:bg-primary-2 text-white font-semibold text-base px-6 py-2 rounded-md transition-colors">
          Chỉnh sửa
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base text-neutral-3">Họ và tên</label>
          <input
            type="text"
            disabled
            value={userInfo?.displayName || ""}
            className="bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none cursor-not-allowed"
          />
        </div>

        {/* Sinh nhật */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base text-neutral-3">Sinh nhật</label>
          <div className="relative">
            <input
              type="date"
              disabled
              placeholder="Chưa cập nhật"
              className="w-full bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-4 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base text-neutral-3">Email</label>
          <input
            type="email"
            disabled
            value={userInfo?.email || ""}
            className="bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-1 outline-none cursor-not-allowed"
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base text-neutral-3">Số điện thoại</label>
          <input
            type="tel"
            disabled
            value={userInfo?.phoneNumber || ""}
            placeholder="Chưa cập nhật"
            className="bg-neutral-20/40 rounded-md px-4 py-3 text-base text-neutral-4 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Xóa tài khoản */}
      <div className="pt-2">
        <button className="border border-primary-1 text-primary-1 hover:bg-primary-6 text-base font-medium px-5 py-2 rounded-md transition-colors">
          Xóa tài khoản
        </button>
      </div>
    </div>
  );
}
