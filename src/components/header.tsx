"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import {
  IoCartOutline,
  IoCloseOutline,
  IoMenuOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { BrandItem } from "@/features/guest/brand";
import { getSubCategories } from "@/features/guest/category";
import { logout } from "@/features/guest/logout";
import { useCartStore } from "@/store";
import { Category, Subcategory } from "@/types/category";
import CategoryDropdown from "./category-dropdown";
import SearchDropdown from "./search-dropdown";

interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  categories: Category[] | null;
  brands?: BrandItem[] | null;
}

const staticLinks = [
  { href: "/about", label: "Về Pet Spots" },
  { href: "/contact", label: "Liên hệ" },
];

export default function Header({
  isLoggedIn,
  isAdmin = false,
  categories,
  brands,
}: HeaderProps) {
  const cartCount = useCartStore((state) => state.totalItems);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileOpenCategorySlug, setMobileOpenCategorySlug] = useState<string | null>(null);
  const [mobileOpenBrandPanel, setMobileOpenBrandPanel] = useState(false);
  const [mobileSubcategories, setMobileSubcategories] = useState<Record<string, Subcategory[]>>(
    {},
  );
  const [mobileLoadingCategorySlug, setMobileLoadingCategorySlug] = useState<string | null>(null);

  const activeCategories = useMemo(
    () => categories?.filter((category) => category.is_active) ?? [],
    [categories],
  );
  const activeBrands = useMemo(() => brands?.filter((brand) => brand.slug) ?? [], [brands]);

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

  useEffect(() => {
    if (!activeCategories.length) {
      setMobileOpenCategorySlug(null);
      return;
    }

    // If slug is null => initial state, auto-open a sensible default
    if (mobileOpenCategorySlug === null) {
      const categoryWithChildren = activeCategories.find(
        (category) => (category.subcategories ?? []).some((subcategory) => subcategory.is_active),
      );
      setMobileOpenCategorySlug(categoryWithChildren?.slug ?? activeCategories[0].slug);
      return;
    }

    // If slug is non-null (including empty string when user closed), do nothing
    // unless the current slug no longer exists in activeCategories — then set a fallback
    if (
      mobileOpenCategorySlug &&
      activeCategories.some((category) => category.slug === mobileOpenCategorySlug)
    ) {
      return;
    }

    const categoryWithChildren = activeCategories.find(
      (category) => (category.subcategories ?? []).some((subcategory) => subcategory.is_active),
    );
    setMobileOpenCategorySlug(categoryWithChildren?.slug ?? activeCategories[0].slug);
  }, [activeCategories, mobileOpenCategorySlug]);

  useEffect(() => {
    const activeCategory = activeCategories.find((category) => category.slug === mobileOpenCategorySlug);

    if (!mobileMenuOpen || !activeCategory) {
      return;
    }

    if (mobileSubcategories[activeCategory.slug]) {
      return;
    }

    let cancelled = false;

    const loadSubcategories = async () => {
      setMobileLoadingCategorySlug(activeCategory.slug);
      try {
        const data = await getSubCategories(activeCategory._id);
        if (cancelled) return;

        setMobileSubcategories((prev) => ({
          ...prev,
          [activeCategory.slug]: data?.filter((subcategory) => subcategory.is_active) ?? [],
        }));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch mobile subcategories:", error);
          setMobileSubcategories((prev) => ({
            ...prev,
            [activeCategory.slug]: [],
          }));
        }
      } finally {
        if (!cancelled) {
          setMobileLoadingCategorySlug((current) => (current === activeCategory.slug ? null : current));
        }
      }
    };

    void loadSubcategories();

    return () => {
      cancelled = true;
    };
  }, [activeCategories, mobileMenuOpen, mobileOpenCategorySlug, mobileSubcategories]);

  const handleCloseOverlays = () => {
    setSearchOpen(false);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    void logout();
  };

  return (
    <header className="w-full border-b border-neutral-7 bg-white">
      <div className="hidden bg-secondary-2 px-4 py-2 md:block">
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
                    {isAdmin ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-1 transition hover:bg-neutral-10"
                      >
                        Trang quản trị
                      </Link>
                    ) : null}
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
                <SearchDropdown onClose={() => setSearchOpen(false)} />
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
        className={`fixed inset-0 z-50 transition lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 z-40 bg-neutral-black/45 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-hidden bg-white px-4 py-4 shadow-xl transition-transform duration-300 z-50 ${
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

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="space-y-4">
              <section className="rounded-2xl border border-neutral-10 bg-white p-3">
                <div className="space-y-2">
                  {staticLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl border border-neutral-10 px-3 py-2 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-10 bg-white p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-4">
                  Sản phẩm
                </p>

                <div className="space-y-2">
                  {activeCategories.map((category) => {
                      const isOpen = mobileOpenCategorySlug === category.slug;
                      const localSubcategories = (category.subcategories ?? []).filter(
                        (subcategory) => subcategory.is_active,
                      );

                      const loadedSubcategories = mobileSubcategories[category.slug];
                      const effectiveSubcategories = Array.isArray(loadedSubcategories)
                        ? loadedSubcategories
                        : localSubcategories;

                      return (
                      <div key={category._id} className="rounded-xl border border-neutral-10">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="min-w-0 flex-1 text-sm font-medium text-neutral-1"
                          >
                            {category.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setMobileOpenCategorySlug((prev) =>
                                prev === category.slug ? "" : category.slug,
                              )
                            }
                            className="rounded-md p-1.5 text-neutral-4 transition hover:bg-neutral-10 hover:text-primary-1"
                            aria-label={isOpen ? `Thu gọn ${category.name}` : `Mở rộng ${category.name}`}
                          >
                            <FaChevronDown
                              size={12}
                              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {isOpen ? (
                          <div className="border-t border-neutral-10 bg-neutral-10/40 px-3 py-2">
                            {mobileLoadingCategorySlug === category.slug && !Array.isArray(loadedSubcategories) ? (
                              <div className="py-1 text-sm text-neutral-4">Đang tải...</div>
                            ) : effectiveSubcategories.length > 0 ? (
                              <div className="grid gap-1">
                                {effectiveSubcategories.map((subcategory) => (
                                  <Link
                                    key={subcategory._id}
                                    href={`/category/${category.slug}/${subcategory.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg px-2 py-1.5 text-sm text-neutral-4 transition hover:bg-white hover:text-primary-1"
                                  >
                                    {subcategory.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="py-1 text-sm text-neutral-4">Không có danh mục con</div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>

              {brands && brands.length > 0 ? (
                <section className="rounded-2xl border border-neutral-10 bg-white p-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenBrandPanel((prev) => !prev)}
                    className="mb-3 flex w-full items-center justify-between text-left"
                    aria-label={mobileOpenBrandPanel ? "Thu gọn thương hiệu" : "Mở rộng thương hiệu"}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-4">
                      Thương hiệu
                    </span>
                    <FaChevronDown
                      size={12}
                      className={`text-neutral-4 transition-transform ${mobileOpenBrandPanel ? "rotate-180" : ""}`}
                    />
                  </button>

                  {mobileOpenBrandPanel ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeBrands.map((brand) => (
                        <Link
                          key={brand._id}
                          href={`/brands/${brand.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-xl border border-neutral-10 px-3 py-2 text-center text-sm text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <section className="mt-auto rounded-2xl border border-neutral-10 bg-neutral-10/60 p-3">
              <div className="grid grid-cols-2 gap-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/userinfo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-2"
                    >
                      Thông tin cá nhân
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-2"
                      >
                        Trang quản trị
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-left text-sm text-neutral-2"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-sm font-medium text-neutral-2"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-neutral-20 bg-white px-3 py-2 text-sm font-medium text-neutral-2"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </header>
  );
}
