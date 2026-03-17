"use client";

import Link from "next/link";
import {
  CartEmptyState,
  CartItemsTable,
  CartOrderSummary,
  CartProgress,
} from "@/features/customer/cart/components";
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
        <CartProgress currentStep={1} />

        <h1 className="mb-5 text-3xl font-bold uppercase text-neutral-1">Giỏ hàng</h1>

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <CartItemsTable
              items={items}
              updateItemQuantity={updateItemQuantity}
              removeItem={removeItem}
              formatCurrency={formatCurrency}
            />

            <CartOrderSummary
              totalPrice={totalPrice}
              shippingFee={shippingFee}
              grandTotal={grandTotal}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </section>
    </div>
  );
}
