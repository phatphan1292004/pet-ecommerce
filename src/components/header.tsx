"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import {
  IoCartOutline,
  IoSearchOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { useCartStore } from "@/store";
import { logout } from "@/features/guest/logout";
import { Category } from "@/types/category";
import CategoryDropdown from "./category-dropdown";
import { BrandItem } from "@/features/guest/brand";
interface HeaderProps {
  isLoggedIn: boolean;
  categories: Category[] | null;
  brands?: BrandItem[] | null; 
}

export default function Header({ isLoggedIn, categories, brands }: HeaderProps) {
  const cartCount = useCartStore((state) => state.totalItems);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  console.log("Header rendered with props:", { isLoggedIn, categories, brands });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
            <span>Hợp tác cùng Pet Spots</span>
            <span className="hidden sm:inline">-</span>
            <span className="flex items-center gap-1">
              Đặt hàng nhanh <strong>0909090909</strong>
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
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/userinfo"
                      className="block px-4 py-2 text-sm hover:bg-neutral-10 text-neutral-1"
                    >
                      Thông tin cá nhân
                    </Link>

                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-10 text-neutral-1"
                      onClick={() => logout()}
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
            {/* Về Pet Spots - Static */}
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

            {/* Dynamic Categories */}
            {categories?.filter(cat => cat.is_active).map((category) => (
              <CategoryDropdown
                key={category._id}
                categoryId={category._id}
                categoryName={category.name}
                categorySlug={category.slug}
              />
            ))}

            {brands && brands.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 text-neutral-1 hover:text-primary-1 transition-colors">
                  Thương hiệu
                  <FaChevronDown size={16} />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      href={`/brands/${brand.slug}`}
                      className="block px-4 py-2 hover:bg-neutral-10 text-neutral-1"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Liên hệ - Static */}
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
            {/* Search */}
            <div className="relative flex items-center">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className={`flex items-center transition-colors ${searchOpen ? "text-primary-1" : "text-neutral-1"}`}
              >
                <IoSearchOutline size={24} />
              </button>

              {/* Floating search bar */}
              {searchOpen && (
                <div className="absolute top-full right-0 mt-5 w-80 bg-white border border-neutral-20 rounded-lg shadow-lg flex items-center gap-2 px-4 py-2.5 z-50 focus-within:border-primary-3 transition-colors">
                  <IoSearchOutline
                    size={18}
                    className="text-neutral-5 shrink-0"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="flex-1 text-sm text-neutral-1 placeholder:text-neutral-5 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-neutral-5 hover:text-neutral-3 transition-colors"
                    >
                      <IoCloseOutline size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center">
              <IoCartOutline className="text-neutral-1" size={24} />
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
