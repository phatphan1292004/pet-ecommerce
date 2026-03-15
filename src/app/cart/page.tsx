"use client";

import Image from "next/image";
import Link from "next/link";
import { FaTruck } from "react-icons/fa";
import { IoCard, IoCartOutline, IoCloseOutline } from "react-icons/io5";
import { useCartStore } from "@/store";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const shippingFee = 0;
  const grandTotal = totalPrice + shippingFee;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-neutral-4">
          <Link href="/" className="hover:text-primary-1 transition-colors">
            Trang chủ
          </Link>
          <span>{">"}</span>
          <span className="text-neutral-1">Giỏ hàng</span>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-12">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <div className="relative flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-1 text-white">
              <IoCartOutline size={22} />
            </span>
            <span className="text-sm font-semibold text-neutral-2">Giỏ hàng</span>
            <div className="pointer-events-none absolute top-5 left-[calc(70%+22px)] hidden h-px w-[calc(50%-22px)] bg-neutral-7 md:block" />
          </div>
          <div className="relative flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-7 text-neutral-4">
              <FaTruck size={18} />
            </span>
            <span className="text-sm font-semibold text-neutral-4">Giao hàng</span>
            <div className="pointer-events-none absolute top-5 left-[calc(70%+22px)] hidden h-px w-[calc(50%-22px)] bg-neutral-7 md:block" />
          </div>
          <div className="relative flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-7 text-neutral-4">
              <IoCard size={18} />
            </span>
            <span className="text-sm font-semibold text-neutral-4">Thanh toán</span>
          </div>
        </div>

        <h1 className="mb-5 text-3xl font-bold uppercase text-neutral-1">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-7 bg-neutral-10 p-10 text-center">
            <p className="text-lg font-medium text-neutral-2">Giỏ hàng của bạn đang trống</p>
            <p className="mt-2 text-neutral-4">Hãy thêm sản phẩm để tiếp tục mua sắm.</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-primary-1 px-6 py-3 font-semibold text-white hover:bg-primary-2 transition-colors"
            >
              Tiếp tục mua hàng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-2xl border border-neutral-7">
              <div className="hidden grid-cols-[1fr_180px_140px_70px] items-center bg-neutral-10 px-6 py-4 text-sm font-semibold text-neutral-2 md:grid">
                <span>Sản phẩm</span>
                <span className="text-left">Số lượng</span>
                <span className="text-left">Giá</span>
                <span className="text-right">&nbsp;</span>
              </div>

              <div className="divide-y divide-neutral-7">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-1 gap-4 px-4 py-5 md:grid-cols-[1fr_180px_140px_70px] md:items-center md:gap-0 md:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-lg bg-neutral-10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <Link
                          href={item.slug ? `/products/${item.slug}` : "#"}
                          className="line-clamp-2 font-semibold text-neutral-1 hover:text-primary-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-7">
                        <button
                          onClick={() => updateItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-2 text-lg text-neutral-4 hover:text-primary-1 transition-colors"
                          aria-label="Giảm số lượng"
                        >
                          -
                        </button>
                        <span className="min-w-10 border-x border-neutral-7 px-3 py-2 text-center text-neutral-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-2 text-lg text-neutral-4 hover:text-primary-1 transition-colors"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-left text-lg font-bold text-neutral-1">
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="rounded-md border border-primary-1 p-2 text-primary-1 hover:bg-primary-1 hover:text-white transition-colors"
                        aria-label="Xóa sản phẩm"
                      >
                        <IoCloseOutline size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-neutral-7 p-5">
              <h2 className="mb-4 text-lg font-bold text-neutral-1">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 border-b border-neutral-7 pb-4 text-neutral-2">
                <div className="flex items-center justify-between">
                  <span>Tiền sản phẩm</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">{formatCurrency(shippingFee)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-lg font-bold text-neutral-1">
                <span>Tổng cộng</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>

              <button className="mt-6 w-full rounded-xl bg-primary-1 py-3 font-semibold text-white transition-colors hover:bg-primary-2">
                Đặt hàng
              </button>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
