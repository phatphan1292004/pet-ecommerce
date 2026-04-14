"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createOrderFromOpenCart } from "@/features/customer/cart/servers";
import { useToast } from "@/hooks";
import { useCartStore } from "@/store";
import { checkoutStorageKey, type CheckoutOrderPayload } from "@/features/customer/cart/checkout-storage";
import { buildVietQRImageUrl, getVietQRConfig } from "@/integrations/vietqr";

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
    id: "vietqr",
    label: "VietQR chuyển khoản",
    description: "Quét VietQR để chuyển khoản nhanh, đúng nội dung.",
    image: "/payment/VietQR_Logo.svg.png",
    imageAlt: "VietQR chuyển khoản",
  },
  {
    id: "momo",
    label: "Ví Momo",
    description: "Thanh toán nhanh qua cổng Momo.",
    image: "/payment/MoMo_Logo_App.svg",
    imageAlt: "Ví Momo",
  },
  {
    id: "vnpay",
    label: "Cổng thanh toán VNPAY",
    description: "Thanh toán online qua cổng VNPAY.",
    image: "/payment/vnpay.svg",
    imageAlt: "Cổng VNPAY",
  },
] as const;

type PaymentMethod = (typeof paymentMethods)[number]["id"];

export default function CartPaymentContent() {
  const router = useRouter();
  const { showSuccess, showWarning } = useToast();
  const vietQRConfig = useMemo(() => getVietQRConfig(), []);
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

  const transferContent = useMemo(() => {
    if (!shippingData) {
      return vietQRConfig.transferPrefix;
    }

    const phoneTail = shippingData.arrivalPhone.replace(/\D/g, "").slice(-4) || "0000";
    return `${vietQRConfig.transferPrefix} ${phoneTail}`;
  }, [shippingData, vietQRConfig.transferPrefix]);

  const vietQRImageUrl = useMemo(
    () =>
      buildVietQRImageUrl({
        bankId: vietQRConfig.bankId,
        accountNo: vietQRConfig.accountNo,
        accountName: vietQRConfig.accountName,
        template: vietQRConfig.template,
        amount: grandTotal,
        addInfo: transferContent,
      }),
    [
      grandTotal,
      transferContent,
      vietQRConfig.accountName,
      vietQRConfig.accountNo,
      vietQRConfig.bankId,
      vietQRConfig.template,
    ]
  );

  const canPlaceOrder =
    Boolean(shippingData) &&
    grandTotal > 0 &&
    !isSubmitting &&
    (paymentMethod !== "vietqr" || vietQRConfig.isConfigured);

  const copyText = async (value: string, fieldName: string) => {
    if (!value.trim()) {
      showWarning(`Chưa có ${fieldName} để sao chép`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showSuccess(`Đã sao chép ${fieldName}`);
    } catch {
      showWarning("Không thể sao chép, vui lòng thử lại");
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingData) {
      showWarning("Thiếu thông tin giao hàng");
      return;
    }

    if (grandTotal <= 0) {
      showWarning("Giỏ hàng đang trống");
      return;
    }

    if (paymentMethod === "vietqr" && !vietQRConfig.isConfigured) {
      showWarning("VietQR chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
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
      if (paymentMethod === "vietqr") {
        showSuccess("Đã tạo đơn hàng. Vui lòng hoàn tất chuyển khoản qua VietQR.");
      } else {
        showSuccess("Đã gửi thông tin thanh toán lên hệ thống");
      }
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Image src={method.image} alt={method.imageAlt} width={35} height={35} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-neutral-1">{method.label}</span>
                    <span className="block text-xs text-neutral-4">{method.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>

          {paymentMethod === "vietqr" ? (
            <div className="mt-4 rounded-xl border border-primary-1/20 bg-primary-3/10 p-4">
              <h3 className="text-sm font-semibold text-neutral-1">Thanh toán bằng VietQR</h3>

              {vietQRConfig.isConfigured ? (
                <div className="mt-3 grid gap-4 lg:grid-cols-[320px_1fr]">
                  <div className="mx-auto w-full max-w-[320px] rounded-xl border border-neutral-7 bg-white p-2">
                    {vietQRImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vietQRImageUrl}
                        alt="VietQR chuyển khoản"
                        className="h-auto w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex h-51 items-center justify-center text-center text-sm text-neutral-4">
                        Không thể tạo mã QR
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-neutral-2">
                    <div className="grid gap-1">
                      <p className="text-xs uppercase tracking-wide text-neutral-4">Ngân hàng</p>
                      <p className="font-semibold">{vietQRConfig.bankName || vietQRConfig.bankId}</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="text-xs uppercase tracking-wide text-neutral-4">Số tài khoản</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{vietQRConfig.accountNo}</p>
                        <button
                          type="button"
                          onClick={() => copyText(vietQRConfig.accountNo, "số tài khoản")}
                          className="rounded-md border border-neutral-7 bg-white px-2 py-1 text-xs font-semibold text-neutral-2 transition hover:border-primary-2 hover:text-primary-1"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <p className="text-xs uppercase tracking-wide text-neutral-4">Chủ tài khoản</p>
                      <p className="font-semibold">{vietQRConfig.accountName || "--"}</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="text-xs uppercase tracking-wide text-neutral-4">Số tiền</p>
                      <p className="font-semibold text-primary-1">{formatCurrency(grandTotal)}</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="text-xs uppercase tracking-wide text-neutral-4">Nội dung chuyển khoản</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{transferContent}</p>
                        <button
                          type="button"
                          onClick={() => copyText(transferContent, "nội dung chuyển khoản")}
                          className="rounded-md border border-neutral-7 bg-white px-2 py-1 text-xs font-semibold text-neutral-2 transition hover:border-primary-2 hover:text-primary-1"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <p className="rounded-lg border border-dashed border-primary-1/30 bg-white px-3 py-2 text-xs text-neutral-4">
                      Vui lòng chuyển đúng số tiền và đúng nội dung để hệ thống xác nhận nhanh hơn.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Chưa cấu hình VietQR. Vui lòng thêm các biến môi trường:
                  <span className="mt-1 block font-semibold">
                    NEXT_PUBLIC_VIETQR_BANK_ID, NEXT_PUBLIC_VIETQR_ACCOUNT_NO, NEXT_PUBLIC_VIETQR_ACCOUNT_NAME
                  </span>
                </div>
              )}
            </div>
          ) : null}
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
