"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";

export default function Header() {
  const [cartCount] = useState(1);

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-secondary-2 py-2 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between text-sm text-neutral-black">
          <div className="flex flex-wrap items-center gap-4 md:gap-2">
            <span>Chăm sóc khách hàng</span>
            <span className="hidden sm:inline">-</span>
            <span>Kiểm tra đơn hàng</span>
            <span className="hidden sm:inline">-</span>
            <span>Hợp tác cùng ODELI</span>
            <span className="hidden sm:inline">-</span>
            <span className="flex items-center gap-1">
              📞 Đặt hàng nhanh <strong>0909090909</strong>
            </span>
          </div>
          {/* User Icon */}
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-neutral-1 transition-colors">
                <FaRegUserCircle size={22} />
                <FaChevronDown size={12} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-36 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/register"
                  className="block px-4 py-2 text-sm hover:bg-neutral-10 text-neutral-1"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm hover:bg-neutral-10 text-neutral-1"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-sm border-b border-neutral-7 py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image 
              src="/logo.png" 
              alt="ODeli Logo" 
              width={120} 
              height={80}
              className="object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <div className="relative group">
              <button className="flex items-center gap-1 text-neutral-1 hover:text-primary-1 transition-colors">
                Về Pet Spots
                <FaChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/about"
                  className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
                >
                  Giới thiệu
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 text-neutral-1 hover:text-primary-1 transition-colors">
                Món ăn, Thức uống
                <FaChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/food"
                  className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
                >
                  Món ăn
                </Link>
                <Link
                  href="/drink"
                  className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
                >
                  Thức uống
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 text-neutral-1 hover:text-primary-1 transition-colors">
                Liên hệ
                <FaChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/contact"
                  className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
                >
                  Liên hệ
                </Link>
              </div>
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <IoCartOutline 
                className="text-neutral-1"
                size={24}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-1 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
