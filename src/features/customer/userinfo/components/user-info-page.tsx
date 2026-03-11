"use client";

import { useState } from "react";
import Link from "next/link";
import { FaRegUserCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaBoxOpen, FaLock } from "react-icons/fa";
import UserInfoTab from "./user-info-tab";
import AddressTab from "./address-tab";
import OrdersTab from "./orders-tab";
import ChangePasswordTab from "./change-password-tab";
import { UserInfo } from "@/types/user";

type Tab = "info" | "address" | "orders" | "password";

export default function UserInfoPage({ userInfo }: { userInfo: UserInfo }) {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-base text-neutral-4 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chủ
        </Link>
        <span className="mx-1">{">"}</span>
        <span className="text-neutral-1">Tài khoản</span>
      </nav>

      <div className="flex gap-20">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <ul className="flex flex-col gap-5">
            <li>
              <button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-lg font-medium transition-colors ${
                  activeTab === "info"
                    ? "text-primary-1"
                    : "text-neutral-3 hover:text-primary-1"
                }`}
              >
                <FaRegUserCircle
                  size={18}
                  className={activeTab === "info" ? "text-primary-1" : "text-neutral-4"}
                />
                Thông tin
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("address")}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "address"
                    ? "text-primary-1"
                    : "text-neutral-3 hover:text-primary-1"
                }`}
              >
                <FaLocationDot
                  size={18}
                  className={activeTab === "address" ? "text-primary-1" : "text-neutral-4"}
                />
                Quản lý địa chỉ
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "orders"
                    ? "text-primary-1"
                    : "text-neutral-3 hover:text-primary-1"
                }`}
              >
                <FaBoxOpen
                  size={18}
                  className={activeTab === "orders" ? "text-primary-1" : "text-neutral-4"}
                />
                Đơn hàng của tôi
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "password"
                    ? "text-primary-1"
                    : "text-neutral-3 hover:text-primary-1"
                }`}
              >
                <FaLock
                  size={18}
                  className={activeTab === "password" ? "text-primary-1" : "text-neutral-4"}
                />
                Đổi mật khẩu
              </button>
            </li>
          </ul>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {activeTab === "info" && <UserInfoTab userInfo={userInfo} />}
          {activeTab === "address" && <AddressTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "password" && <ChangePasswordTab />}
        </main>
      </div>
    </div>
  );
}
