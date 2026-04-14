"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import {
  IoCartOutline,
  IoCloseOutline,
  IoMenuOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { BrandItem } from "@/features/guest/brand";
import { logout } from "@/features/guest/logout";
import { useCartStore } from "@/store";
import { Category } from "@/types/category";
import CategoryDropdown from "./category-dropdown";

interface HeaderProps {
  isLoggedIn: boolean;
  categories: Category[] | null;
  brands?: BrandItem[] | null;
}

const staticLinks = [
  { href: "/about", label: "Về Pet Spots" },
  { href: "/contact", label: "Liên hệ" },
];

export default function Header({
  isLoggedIn,
  categories,
  brands,
}: HeaderProps) {
  const cartCount = useCartStore((state) => state.totalItems);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCloseOverlays = () => {
    setSearchOpen(false);
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    void logout();
  };

  return (
    <header className="w-full border-b border-neutral-7 bg-white">
      <div className="bg-secondary-2 px-4 py-2">
        <div className="container mx-auto flex items-center gap-3 text-xs sm:text-sm">
          <div className="hidden items-center gap-2 text-neutral-black md:flex">
            <span>Chăm sóc khách hàng</span>
            <span>-</span>
            <span>Kiểm tra đơn hàng</span>
            <span>-</span>
            <span>Hợp tác cùng Pet Spots</span>
            <span>-</span>
            <span>Đặt hàng nhanh 0909090909</span>
          </div>

          <span className="line-clamp-1 text-neutral-black md:hidden">
            Đặt hàng nhanh 0909090909
          </span>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 text-neutral-1 transition-colors hover:text-primary-1"
              aria-label="Tài khoản"
            >
              <FaRegUserCircle size={20} />
              <FaChevronDown size={11} />
            </button>

            {accountMenuOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-neutral-20 bg-white shadow-lg">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/userinfo"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-1 transition hover:bg-neutral-10"
                    >
                      Thông tin cá nhân
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-neutral-1 transition hover:bg-neutral-10"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-1 transition hover:bg-neutral-10"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-1 transition hover:bg-neutral-10"
                    >
                      Đăng nhập
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-neutral-20 p-2 text-neutral-2 transition hover:border-primary-1 hover:text-primary-1 lg:hidden"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setSearchOpen(false);
                setAccountMenuOpen(false);
              }}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? (
                <IoCloseOutline size={20} />
              ) : (
                <IoMenuOutline size={20} />
              )}
            </button>

            <Link href="/" className="shrink-0" onClick={handleCloseOverlays}>
              <Image
                src="/logo.png"
                alt="ODeli Logo"
                width={120}
                height={80}
                className="h-auto w-24 object-contain sm:w-28"
                priority
              />
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {staticLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-1 transition-colors hover:text-primary-1"
              >
                {link.label}
              </Link>
            ))}

            {categories
              ?.filter((category) => category.is_active)
              .map((category) => (
                <CategoryDropdown
                  key={category._id}
                  categoryId={category._id}
                  categoryName={category.name}
                  categorySlug={category.slug}
                />
              ))}

            {brands && brands.length > 0 ? (
              <div className="group relative">
                <button className="flex items-center gap-1 text-neutral-1 transition-colors hover:text-primary-1">
                  Thương hiệu
                  <FaChevronDown size={14} />
                </button>

                <div className="invisible absolute left-0 top-full z-50 mt-2 w-52 rounded-md border border-neutral-20 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      href={`/brands/${brand.slug}`}
                      className="block px-4 py-2 text-neutral-1 transition hover:bg-neutral-10"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center transition-colors ${
                  searchOpen ? "text-primary-1" : "text-neutral-1"
                }`}
                aria-label="Tìm kiếm"
              >
                <IoSearchOutline size={24} />
              </button>

              {searchOpen ? (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 flex w-[calc(100vw-2rem)] max-w-sm items-center gap-2 rounded-lg border border-neutral-20 bg-white px-4 py-2.5 shadow-lg focus-within:border-primary-3 sm:w-80">
                  <IoSearchOutline
                    size={18}
                    className="shrink-0 text-neutral-5"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="flex-1 bg-transparent text-sm text-neutral-1 outline-none placeholder:text-neutral-5"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-neutral-5 transition-colors hover:text-neutral-3"
                      aria-label="Xóa từ khóa"
                    >
                      <IoCloseOutline size={18} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Link
              href="/cart"
              className="relative flex items-center"
              onClick={handleCloseOverlays}
            >
              <IoCartOutline className="text-neutral-1" size={24} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-1 text-xs text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-70 transition lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-neutral-black/45 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white px-4 py-4 shadow-xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-neutral-20 pb-3">
            <Image
              src="/logo.png"
              alt="ODeli Logo"
              width={110}
              height={56}
              className="h-auto w-24"
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md border border-neutral-20 p-2 text-neutral-3"
              aria-label="Đóng"
            >
              <IoCloseOutline size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/userinfo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2"
                >
                  Thông tin cá nhân
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-neutral-20 px-3 py-2 text-left text-sm text-neutral-2"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {staticLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-1 py-1 text-sm font-medium text-neutral-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-4">
              Danh mục
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories
                ?.filter((category) => category.is_active)
                .map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2"
                  >
                    {category.name}
                  </Link>
                ))}
            </div>
          </div>

          {brands && brands.length > 0 ? (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-4">
                Thương hiệu
              </p>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brands/${brand.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </header>
  );
}
