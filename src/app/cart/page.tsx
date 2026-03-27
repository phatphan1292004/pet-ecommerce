"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CartEmptyState,
  CartItemsTable,
  CartOrderSummary,
  CartProgress,
} from "@/features/customer/cart/components";
import { getOpenCart, removeOpenCartItem, updateOpenCartItem } from "@/features/customer/cart/servers";
import { useToast } from "@/hooks";
import { useCartStore } from "@/store";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function CartPage() {
  const { showWarning } = useToast();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    let isMounted = true;

    const hydrateOpenCart = async () => {
      const response = await getOpenCart();

      if (!isMounted || !response.success || !response.data) {
        return;
      }

      setItems(response.data.items);
    };

    void hydrateOpenCart();

    return () => {
      isMounted = false;
    };
  }, [setItems]);

  const handleUpdateItemQuantity = async (productId: string, quantity: number) => {
    updateItemQuantity(productId, quantity);

    const response = await updateOpenCartItem(productId, quantity);
    if (!response.success) {
      showWarning("Chưa đồng bộ được số lượng sản phẩm lên hệ thống");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    removeItem(productId);

    const response = await removeOpenCartItem(productId);
    if (!response.success) {
      showWarning("Chưa đồng bộ được thao tác xóa sản phẩm lên hệ thống");
    }
  };

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
              updateItemQuantity={handleUpdateItemQuantity}
              removeItem={handleRemoveItem}
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
