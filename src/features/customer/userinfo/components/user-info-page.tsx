"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { FaRegUserCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaBoxOpen, FaHeart, FaLock } from "react-icons/fa";
import type { IconType } from "react-icons";
import UserInfoTab from "./user-info-tab";
import AddressTab from "./address-tab";
import OrdersTab from "./orders-tab";
import ChangePasswordTab from "./change-password-tab";
import { UserInfo } from "@/types/user";
import { UserAddress } from "@/types/address";
import type { FavoriteProduct } from "../servers/favorite";
import FavoritesTab from "./favorites-tab";

interface TabItem {
  id: string;
  label: string;
  icon: IconType;
  render: (userInfo: UserInfo, addresses: UserAddress[]) => React.ReactNode;
}

const USERINFO_TAB_ORDER = ["info", "address", "orders", "love", "password"] as const;

const resolveInitialTabIndex = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const tabId = window.sessionStorage.getItem("userinfo:targetTab")?.trim().toLowerCase();
  if (!tabId) {
    return 0;
  }

  window.sessionStorage.removeItem("userinfo:targetTab");

  const nextTabIndex = USERINFO_TAB_ORDER.findIndex((id) => id === tabId);
  return nextTabIndex >= 0 ? nextTabIndex : 0;
};

export default function UserInfoPage({
  userInfo,
  addresses,
  favorites,
}: {
  userInfo: UserInfo;
  addresses: UserAddress[];
  favorites: FavoriteProduct[];
}) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(resolveInitialTabIndex);

  const tabs: TabItem[] = [
    {
      id: "info",
      label: "Thông tin",
      icon: FaRegUserCircle,
      render: (info) => <UserInfoTab userInfo={info} />,
    },
    {
      id: "address",
      label: "Quản lý địa chỉ",
      icon: FaLocationDot,
      render: (_info, userAddresses) => <AddressTab initialAddresses={userAddresses} />,
    },
    {
      id: "orders",
      label: "Đơn hàng của tôi",
      icon: FaBoxOpen,
      render: () => <OrdersTab />,
    },
    {
      id: "love",
      label: "Sản phẩm yêu thích",
      icon: FaHeart,
      render: () => <FavoritesTab favorites={favorites} />,
    },
    {
      id: "password",
      label: "Đổi mật khẩu",
      icon: FaLock,
      render: () => <ChangePasswordTab />,
    },
  ];

  const currentTabLabel = tabs[selectedTabIndex]?.label || "Tài khoản";
  const tabListRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-neutral-4 sm:mb-6 sm:text-base">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chủ
        </Link>
        <span className="mx-1">{"/"}</span>
        <Link href="/userinfo" className="hover:text-primary-1 transition-colors">
          Thông tin cá nhân
        </Link>
        <span className="mx-1">{"/"}</span>
        <span className="text-neutral-1">{currentTabLabel}</span>
      </nav>

      <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-12">
          {/* Sidebar - Tab List (horizontal slider on mobile) */}
          <aside className="w-full lg:w-60 lg:shrink-0 relative">
            {/* Mobile: horizontal scroll only (no prev/next controls) */}
            <div ref={tabListRef} className="overflow-x-auto lg:overflow-visible">
              <TabList className="flex gap-2 pb-1 lg:flex-col lg:gap-4 lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none lg:w-full lg:text-base ${
                        selected
                          ? "bg-primary-6 text-primary-1"
                          : "text-neutral-3 hover:bg-neutral-10 hover:text-primary-1"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <Icon
                          size={18}
                          className={
                            selected ? "text-primary-1" : "text-neutral-4"
                          }
                        />
                        {tab.label}
                      </>
                    )}
                  </Tab>
                );
              })}
              </TabList>
            </div>
          </aside>

          {/* Main content - Tab Panels */}
          <main className="flex-1">
            <TabPanels>
              {tabs.map((tab) => (
                <TabPanel key={tab.id} className="outline-none">
                  {tab.render(userInfo, addresses)}
                </TabPanel>
              ))}
            </TabPanels>
          </main>
        </div>
      </TabGroup>
    </div>
  );
}
