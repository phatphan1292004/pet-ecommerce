"use client";
import Link from "next/link";
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

      <TabGroup>
        <div className="flex gap-20">
          {/* Sidebar - Tab List */}
          <aside className="w-52 shrink-0">
            <TabList className="flex flex-col gap-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      `flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors outline-none ${
                        selected
                          ? "text-primary-1"
                          : "text-neutral-3 hover:text-primary-1"
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
                <TabPanel key={tab.id}>{tab.render(userInfo, addresses)}</TabPanel>
              ))}
            </TabPanels>
          </main>
        </div>
      </TabGroup>
    </div>
  );
}
