"use client";

import { useRouter } from "next/navigation";

interface CartOrderSummaryProps {
  totalPrice: number;
  shippingFee: number;
  grandTotal: number;
  formatCurrency: (value: number) => string;
}

export default function CartOrderSummary({
  totalPrice,
  shippingFee,
  grandTotal,
  formatCurrency,
}: CartOrderSummaryProps) {
  const router = useRouter();
  const canGoToShipping = grandTotal > 0;

  const handlePlaceOrder = () => {
    if (!canGoToShipping) {
      return;
    }

    router.push("/cart/shipping");
  };

  return (
    <aside className="h-fit rounded-2xl border border-neutral-7 p-5">
      <h2 className="mb-4 text-lg font-bold text-neutral-1">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 border-b border-neutral-7 pb-4 text-neutral-1">
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

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={!canGoToShipping}
        className="mt-6 w-full rounded-xl bg-primary-1 py-3 font-semibold text-white transition-colors hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-7"
      >
        Đặt hàng
      </button>
    </aside>
  );
}
