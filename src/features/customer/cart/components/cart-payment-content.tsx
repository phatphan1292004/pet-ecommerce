"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createOrderFromOpenCart } from "@/features/customer/cart/servers";
import { useToast } from "@/hooks";
import { useCartStore } from "@/store";
import { checkoutStorageKey, type CheckoutOrderPayload } from "@/features/customer/cart/checkout-storage";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

const paymentMethods = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán tiền mặt cho nhân viên giao hàng.",
    image: "/payment/cod.svg",
    imageAlt: "COD",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    description: "Nhân viên sẽ liên hệ để cung cấp thông tin tài khoản.",
    image: "/payment/bank.svg",
    imageAlt: "Chuyển khoản ngân hàng",
  },
  {
    id: "wallet",
    label: "Ví điện tử",
    description: "Hoàn tất thanh toán qua ví điện tử.",
    image: "/payment/wallet.svg",
    imageAlt: "Ví điện tử",
  },
] as const;

type PaymentMethod = (typeof paymentMethods)[number]["id"];

export default function CartPaymentContent() {
  const router = useRouter();
  const { showSuccess, showWarning } = useToast();
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [shippingData, setShippingData] = useState<CheckoutOrderPayload | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showWarningRef = useRef(showWarning);

  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  const shippingFee = 0;
  const grandTotal = totalPrice + shippingFee;

  useEffect(() => {
    const stored = sessionStorage.getItem(checkoutStorageKey);
    if (!stored) {
      showWarningRef.current("Vui lòng nhập thông tin giao hàng trước");
      router.replace("/cart/shipping");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CheckoutOrderPayload;
      const hasRequiredFields =
        Boolean(parsed.arrivalName?.trim()) &&
        Boolean(parsed.arrivalPhone?.trim()) &&
        Boolean(parsed.arrivalAddress?.trim());

      if (!hasRequiredFields) {
        throw new Error("missing_fields");
      }

      setShippingData(parsed);
    } catch {
      sessionStorage.removeItem(checkoutStorageKey);
      showWarningRef.current("Vui lòng nhập lại thông tin giao hàng");
      router.replace("/cart/shipping");
    }
  }, [router]);

  const addressSummary = useMemo(() => {
    if (!shippingData) {
      return "";
    }

    return shippingData.arrivalAddress;
  }, [shippingData]);

  const canPlaceOrder = Boolean(shippingData) && grandTotal > 0 && !isSubmitting;

  const handlePlaceOrder = async () => {
    if (!shippingData) {
      showWarning("Thiếu thông tin giao hàng");
      return;
    }

    if (grandTotal <= 0) {
      showWarning("Giỏ hàng đang trống");
      return;
    }

    const payload = {
      ...shippingData,
      status: "pending",
      paymentMethod,
    };

    setIsSubmitting(true);

    try {
      const result = await createOrderFromOpenCart(payload);

      if (!result.success) {
        showWarning(result.message || "Không thể tạo đơn hàng");
        return;
      }

      clearCart();
      sessionStorage.removeItem(checkoutStorageKey);
      showSuccess("Đã gửi thông tin thanh toán lên hệ thống");
      router.push("/userinfo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shippingData) {
    return <p className="text-sm text-neutral-4">Đang chuyển hướng...</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-neutral-7 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary-1">Thông tin giao hàng</h2>
            <span className="rounded-full border border-primary-1/20 bg-primary-3/10 px-3 py-1 text-xs font-semibold text-primary-1">
              Đã xác nhận
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-neutral-1 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-4">Người nhận</p>
              <p className="text-base font-semibold text-neutral-1">{shippingData.arrivalName}</p>
              <p className="text-sm text-neutral-4">{shippingData.arrivalPhone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-4">Địa chỉ giao hàng</p>
              <p className="text-sm text-neutral-1">{addressSummary}</p>
            </div>
          </div>
          {shippingData.note ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-7 bg-neutral-10 px-4 py-3 text-sm text-neutral-4">
              <span className="font-semibold text-neutral-1">Ghi chú:</span> {shippingData.note}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-7 p-5">
          <h2 className="text-base font-semibold text-primary-1">Phương thức thanh toán</h2>
          <div className="mt-4 space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors " +
                  (paymentMethod === method.id
                    ? "border-primary-1 bg-primary-3/10"
                    : "border-neutral-7 bg-white hover:border-primary-2")
                }
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="h-4 w-4 self-center accent-primary-1"
                />
                <span className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-7 bg-white">
                    <Image src={method.image} alt={method.imageAlt} width={28} height={28} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-neutral-1">{method.label}</span>
                    <span className="block text-xs text-neutral-4">{method.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-neutral-7 p-5">
        <h2 className="mb-4 text-lg font-bold text-neutral-1">Tóm tắt thanh toán</h2>

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
          disabled={!canPlaceOrder}
          className="mt-6 w-full rounded-xl bg-primary-1 py-3 font-semibold text-white transition-colors hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-7"
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
        </button>
      </aside>
    </div>
  );
}
