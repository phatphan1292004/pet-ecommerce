import Link from "next/link";

interface VnpayReturnPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")} đ`;

const getSearchParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function VnpayReturnPage({
  searchParams,
}: VnpayReturnPageProps) {
  const params = await searchParams;

  const status = getSearchParamValue(params.status);
  const orderId = getSearchParamValue(params.orderId);
  const responseCode = getSearchParamValue(params.code);
  const transactionNo = getSearchParamValue(params.transactionNo);
  const amountRaw = getSearchParamValue(params.amount);

  const isPaid = status === "success";
  const amount = amountRaw ? Number(amountRaw) / 100 : undefined;

  return (
    <section className="min-h-screen bg-white py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-neutral-7 bg-white p-6 shadow-sm sm:p-8">
          
          {/* STATUS */}
          <p
            className={
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
              (isPaid
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-amber-200 bg-amber-50 text-amber-700")
            }
          >
            {isPaid ? "Giao dịch thành công" : "Giao dịch chưa thành công"}
          </p>

          {/* TITLE */}
          <h1 className="mt-4 text-2xl font-bold text-neutral-1 sm:text-3xl">
            {isPaid
              ? "Thanh toán VNPAY thành công"
              : "Thanh toán VNPAY thất bại"}
          </h1>

          {/* MESSAGE */}
          <p className="mt-3 text-sm text-neutral-3">
            {isPaid
              ? "Đơn hàng của bạn đã được thanh toán thành công."
              : `Thanh toán không thành công${
                  responseCode ? ` (Mã lỗi: ${responseCode})` : ""
                }`}
          </p>

          {/* INFO */}
          <div className="mt-6 grid gap-3 rounded-xl border border-neutral-7 bg-neutral-10 p-4 text-sm text-neutral-2">
            
            {orderId && (
              <div className="flex justify-between">
                <span>Mã đơn hàng</span>
                <span className="font-semibold text-neutral-1">
                  {orderId}
                </span>
              </div>
            )}

            {transactionNo && (
              <div className="flex justify-between">
                <span>Mã giao dịch VNPAY</span>
                <span className="font-semibold text-neutral-1">
                  {transactionNo}
                </span>
              </div>
            )}

            {typeof amount === "number" && (
              <div className="flex justify-between">
                <span>Số tiền</span>
                <span className="font-semibold text-neutral-1">
                  {formatCurrency(amount)}
                </span>
              </div>
            )}

            {responseCode && (
              <div className="flex justify-between">
                <span>Mã phản hồi</span>
                <span className="font-semibold text-neutral-1">
                  {responseCode}
                </span>
              </div>
            )}
          </div>

          {/* ACTION */}
          <div className="mt-6 flex gap-3">
            <Link
              href="/userinfo"
              className="rounded-xl bg-primary-1 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-2"
            >
              Xem đơn hàng
            </Link>

            <Link
              href="/cart/payment"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:border-primary-2 hover:text-primary-1"
            >
              Quay lại thanh toán
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}