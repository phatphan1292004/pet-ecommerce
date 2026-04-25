"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncOpenCartPricing } from "@/features/customer/cart/servers";
import { useToast } from "@/hooks";
import { useCheckoutStore } from "@/store";

interface CartOrderSummaryProps {
  totalPrice: number;
  shippingFee: number;
  grandTotal: number;
  availableCoupons: CouponOption[];
  formatCurrency: (value: number) => string;
}

interface CouponOption {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  description?: string;
}

const buildCouponLabel = (
  coupon: CouponOption,
  formatCurrency: (value: number) => string
): string => {
  const discountText =
    coupon.discountType === "percent"
      ? `Giảm ${coupon.discountValue}%`
      : `Giảm ${formatCurrency(coupon.discountValue)}`;

  const ruleTexts: string[] = [];

  if (coupon.minOrderValue && coupon.minOrderValue > 0) {
    ruleTexts.push(`đơn từ ${formatCurrency(coupon.minOrderValue)}`);
  }

  if (coupon.discountType === "percent" && coupon.maxDiscount && coupon.maxDiscount > 0) {
    ruleTexts.push(`tối đa ${formatCurrency(coupon.maxDiscount)}`);
  }

  return `${coupon.code} - ${discountText}${
    ruleTexts.length > 0 ? ` (${ruleTexts.join(", ")})` : ""
  }`;
};

const calculateDiscount = (coupon: CouponOption | undefined, orderValue: number) => {
  if (!coupon) {
    return 0;
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    return 0;
  }

  if (coupon.discountType === "percent") {
    const rawDiscount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      return Math.min(rawDiscount, coupon.maxDiscount);
    }

    return rawDiscount;
  }

  return Math.min(coupon.discountValue, orderValue);
};

export default function CartOrderSummary({
  totalPrice,
  shippingFee,
  grandTotal,
  availableCoupons,
  formatCurrency,
}: CartOrderSummaryProps) {
  const router = useRouter();
  const { showWarning } = useToast();
  const showWarningRef = useRef(showWarning);
  const setCheckoutPricing = useCheckoutStore((state) => state.setPricing);
  const clearCheckoutShippingData = useCheckoutStore(
    (state) => state.clearShippingData,
  );
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>("");

  const couponOptions = useMemo(
    () =>
      availableCoupons.map((coupon) => ({
        ...coupon,
        label: buildCouponLabel(coupon, formatCurrency),
      })),
    [availableCoupons, formatCurrency],
  );

  const selectedCoupon = useMemo(
    () => availableCoupons.find((coupon) => coupon.code === selectedCouponCode),
    [availableCoupons, selectedCouponCode],
  );

  const isCouponEligible =
    !selectedCoupon?.minOrderValue || totalPrice >= selectedCoupon.minOrderValue;
  const appliedCouponCode = isCouponEligible ? selectedCoupon?.code : undefined;
  const discountValue = calculateDiscount(isCouponEligible ? selectedCoupon : undefined, totalPrice);
  const finalGrandTotal = Math.max(0, grandTotal - discountValue);
  const canGoToShipping = totalPrice > 0;

  const handleCouponChange = (nextCouponCode: string) => {
    setSelectedCouponCode(nextCouponCode);
  };

  useEffect(() => {
    setCheckoutPricing({
      subtotal: totalPrice,
      shippingFee,
      couponCode: appliedCouponCode,
      couponDiscount: discountValue,
    });
  }, [
    appliedCouponCode,
    discountValue,
    setCheckoutPricing,
    shippingFee,
    totalPrice,
  ]);

  useEffect(() => {
    void (async () => {
      const response = await syncOpenCartPricing({
        coupon: appliedCouponCode,
        couponCode: appliedCouponCode,
        totalPrice,
        totalDiscount: discountValue,
        finalPrice: finalGrandTotal,
      });

      if (!response.success) {
        showWarningRef.current("Chưa đồng bộ được mã giảm giá lên giỏ hàng");
      }
    })();
  }, [
    appliedCouponCode,
    discountValue,
    finalGrandTotal,
    totalPrice,
  ]);

  const handlePlaceOrder = () => {
    if (!canGoToShipping) {
      return;
    }

    clearCheckoutShippingData();
    setCheckoutPricing({
      subtotal: totalPrice,
      shippingFee,
      couponCode: appliedCouponCode,
      couponDiscount: discountValue,
    });

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
        <div className="flex items-center justify-between">
          <span>Giảm giá</span>
          <span className="font-semibold text-primary-1">-{formatCurrency(discountValue)}</span>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="coupon-select" className="mb-2 block text-sm font-semibold text-neutral-1">
          Mã giảm giá
        </label>
        <select
          id="coupon-select"
          value={selectedCouponCode}
          onChange={(event) => handleCouponChange(event.target.value)}
          className="w-full rounded-lg border border-neutral-7 bg-white px-3 py-2 text-sm text-neutral-1 outline-none transition-colors focus:border-primary-1"
        >
          <option value="">Không áp dụng</option>
          {couponOptions.map((coupon) => (
            <option key={coupon.code} value={coupon.code}>
              {coupon.label}
            </option>
          ))}
        </select>
        {couponOptions.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-4">Hiện chưa có mã giảm giá khả dụng.</p>
        ) : null}
        {selectedCoupon && !isCouponEligible && selectedCoupon.minOrderValue ? (
          <p className="mt-2 text-xs text-primary-1">
            Đơn tối thiểu để dùng mã này: {formatCurrency(selectedCoupon.minOrderValue)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-lg font-bold text-neutral-1">
        <span>Tổng cộng</span>
        <span>{formatCurrency(finalGrandTotal)}</span>
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
