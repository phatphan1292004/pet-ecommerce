"use client";
import Link from "next/link";
import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { FaRegUserCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaBoxOpen, FaLock } from "react-icons/fa";
import type { IconType } from "react-icons";
import UserInfoTab from "./user-info-tab";
import AddressTab from "./address-tab";
import OrdersTab from "./orders-tab";
import ChangePasswordTab from "./change-password-tab";
import { UserInfo } from "@/types/user";
import { UserAddress } from "@/types/address";

interface TabItem {
  id: string;
  label: string;
  icon: IconType;
  render: (userInfo: UserInfo, addresses: UserAddress[]) => React.ReactNode;
}

export default function UserInfoPage({
  userInfo,
  addresses,
}: {
  userInfo: UserInfo;
  addresses: UserAddress[];
}) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

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
      icon: FaLock,
      render: () => <ChangePasswordTab />,
    },
    {
      id: "password",
      label: "Đổi mật khẩu",
      icon: FaLock,
      render: () => <ChangePasswordTab />,
    },
  ];

  const currentTabLabel = tabs[selectedTabIndex]?.label || "Tài khoản";

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-neutral-4 sm:mb-6 sm:text-base">
        <Link href="/" className="hover:text-primary-1 transition-colors">
          Trang chủ
        </Link>
        <span className="mx-1">{">"}</span>
        <Link href="/userinfo" className="hover:text-primary-1 transition-colors">
          Thông tin cá nhân
        </Link>
        <span className="mx-1">{">"}</span>
        <span className="text-neutral-1">{currentTabLabel}</span>
      </nav>

      <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-12">
          {/* Sidebar - Tab List */}
          <aside className="w-full lg:w-60 lg:shrink-0">
            <TabList className="flex flex-wrap gap-2 pb-1 lg:flex-col lg:gap-4 lg:pb-0">
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
