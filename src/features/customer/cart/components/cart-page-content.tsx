"use client";

import { useEffect } from "react";
import {
  CartEmptyState,
  CartItemsTable,
  CartOrderSummary,
  CartProgress,
} from "@/features/customer/cart/components";
import { removeOpenCartItem, updateOpenCartItem } from "@/features/customer/cart/servers";
import { useToast } from "@/hooks";
import { useCartStore, type CartItem } from "@/store";

interface CartPageContentProps {
  initialItems: CartItem[];
  initialCoupons: Array<{
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    description?: string;
  }>;
}

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function CartPageContent({ initialItems, initialCoupons }: CartPageContentProps) {
  const { showWarning } = useToast();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

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
            availableCoupons={initialCoupons}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
    </section>
  );
}
