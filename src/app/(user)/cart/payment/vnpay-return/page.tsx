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

  const code = responseCode?.toString().trim();

  const vnpayResponseMap: Record<
    string,
    { title: string; description: string; suggestion?: string }
  > = {
    "00": {
      title: "Giao dịch thành công",
      description: "Giao dịch đã được xử lý thành công tại VNPAY.",
    },
    "07": {
      title: "Giao dịch nghi ngờ",
      description:
        "Trừ tiền thành công nhưng giao dịch bị nghi ngờ (liên quan đến lừa đảo hoặc bất thường).",
      suggestion: "Liên hệ ngân hàng hoặc bộ phận hỗ trợ nếu số tiền đã bị trừ.",
    },
    "09": {
      title: "Chưa đăng ký Internet Banking",
      description:
        "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      suggestion: "Khách hàng cần sử dụng phương thức khác hoặc đăng ký InternetBanking.",
    },
    "10": {
      title: "Xác thực thông tin sai nhiều lần",
      description:
        "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
      suggestion: "Thử lại sau hoặc liên hệ ngân hàng để mở khóa.",
    },
    "11": {
      title: "Hết hạn chờ thanh toán",
      description: "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
    },
    "12": {
      title: "Tài khoản bị khóa",
      description: "Thẻ/Tài khoản của khách hàng bị khóa.",
      suggestion: "Liên hệ ngân hàng để mở khóa tài khoản.",
    },
    "13": {
      title: "Nhập sai OTP",
      description:
        "Khách hàng nhập sai mật khẩu xác thực giao dịch (OTP). Xin thử lại.",
    },
    "24": {
      title: "Khách hàng hủy giao dịch",
      description: "Khách hàng đã hủy giao dịch trước khi hoàn tất.",
    },
    "51": {
      title: "Không đủ số dư",
      description: "Tài khoản của khách hàng không đủ số dư để thực hiện giao dịch.",
      suggestion: "Nạp thêm tiền hoặc chọn phương thức thanh toán khác.",
    },
    "65": {
      title: "Vượt giới hạn giao dịch",
      description: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
      suggestion: "Thử lại vào ngày hôm sau hoặc liên hệ ngân hàng.",
    },
    "75": {
      title: "Ngân hàng bảo trì",
      description: "Ngân hàng thanh toán đang bảo trì. Vui lòng thử lại sau.",
    },
    "79": {
      title: "Nhập sai mật khẩu quá số lần",
      description:
        "Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định. Xin thử lại.",
    },
  };

  const codeInfo = code ? vnpayResponseMap[code] : undefined;

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
            {isPaid ? (
              "Đơn hàng của bạn đã được thanh toán thành công."
            ) : codeInfo ? (
              <>
                <strong className="font-semibold text-neutral-1">{codeInfo.title}.</strong>{" "}
                <span>{codeInfo.description}</span>
                {codeInfo.suggestion ? (
                  <div className="mt-2 text-sm text-neutral-4">Gợi ý: {codeInfo.suggestion}</div>
                ) : null}
              </>
            ) : (
              `Thanh toán không thành công${responseCode ? ` (Mã lỗi: ${responseCode})` : ""}`
            )}
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
                <span className="font-semibold text-neutral-1">{responseCode}</span>
              </div>
            )}

            {codeInfo && (
              <div className="mt-2 rounded-lg bg-white/50 p-3 text-sm text-neutral-3">
                <div className="font-semibold text-neutral-1">Chi tiết:</div>
                <div>{codeInfo.description}</div>
                {codeInfo.suggestion ? <div className="mt-1">Gợi ý: {codeInfo.suggestion}</div> : null}
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
          </div>
        </div>
      </div>
    </section>
  );
}