import Link from "next/link";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import type { AdminOrderDetail, AdminOrderItem } from "@/features/admin/order/servers";

interface OrderDetailPageProps {
  order: AdminOrderDetail;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value?: number) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} VND` : "--";

const normalizeStatus = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, "_").replace(/đ/g, "d");

const statusTokens = {
  pending: ["pending", "cho_xac_nhan", "dang_cho", "awaiting", "waiting"],
  processing: ["processing", "confirmed", "xac_nhan", "da_xac_nhan"],
  delivering: ["delivering", "shipping", "dang_giao", "in_transit"],
  delivered: ["delivered", "da_giao", "completed", "done", "hoan_thanh"],
  cancelled: ["cancelled", "canceled", "da_huy", "huy"],
};

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (statusTokens.pending.some((token) => normalized.includes(token))) {
    return "Chờ xác nhận";
  }
  if (statusTokens.processing.some((token) => normalized.includes(token))) {
    return "Đã xác nhận";
  }
  if (statusTokens.delivering.some((token) => normalized.includes(token))) {
    return "Đang giao";
  }
  if (statusTokens.delivered.some((token) => normalized.includes(token))) {
    return "Hoàn thành";
  }
  if (statusTokens.cancelled.some((token) => normalized.includes(token))) {
    return "Đã hủy";
  }

  return status || "--";
};

const getStatusStyles = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (statusTokens.pending.some((token) => normalized.includes(token))) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (statusTokens.processing.some((token) => normalized.includes(token))) {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }
  if (statusTokens.delivering.some((token) => normalized.includes(token))) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (statusTokens.delivered.some((token) => normalized.includes(token))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (statusTokens.cancelled.some((token) => normalized.includes(token))) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-neutral-20 bg-neutral-10 text-neutral-4";
};

const getPaymentStatus = (order: AdminOrderDetail) => {
  const normalizedStatus = normalizeStatus(order.status);

  if (statusTokens.delivered.some((token) => normalizedStatus.includes(token))) {
    return {
      label: "Đã thanh toán",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (statusTokens.cancelled.some((token) => normalizedStatus.includes(token))) {
    return {
      label: "Không thanh toán",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "Đang chờ thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
};

const getPaymentMethodLabel = (method?: string) => {
  if (!method) {
    return "--";
  }

  const normalized = method.toLowerCase();
  if (normalized === "cod") {
    return "COD";
  }
  if (normalized === "bank") {
    return "Chuyển khoản";
  }
  if (normalized === "wallet") {
    return "Ví điện tử";
  }

  return method;
};

const getItems = (order: AdminOrderDetail): AdminOrderItem[] =>
  order.cart?.products || order.products || order.items || order.cartItems || [];

const getTotalQuantity = (items: AdminOrderItem[]) =>
  items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

const getShortOrderId = (orderId?: string) => {
  if (!orderId) {
    return "------";
  }

  return orderId.length > 6 ? orderId.slice(-6).toUpperCase() : orderId.toUpperCase();
};

const getNameInitials = (name?: string) => {
  if (!name) {
    return "KH";
  }

  const parts = name
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "KH";
  }

  return parts.map((item) => item.charAt(0).toUpperCase()).join("");
};

const getStatusStep = (status?: string): number => {
  const normalized = normalizeStatus(status);

  if (statusTokens.delivered.some((token) => normalized.includes(token))) {
    return 4;
  }
  if (statusTokens.delivering.some((token) => normalized.includes(token))) {
    return 3;
  }
  if (statusTokens.processing.some((token) => normalized.includes(token))) {
    return 2;
  }

  return 1;
};

const buildTimeline = (order: AdminOrderDetail) => {
  const normalizedStatus = normalizeStatus(order.status);
  const currentStep = getStatusStep(order.status);
  const isCancelled = statusTokens.cancelled.some((token) => normalizedStatus.includes(token));

  const placedAt = order.createdAt;
  const processedAt =
    statusTokens.processing.some((token) => normalizedStatus.includes(token)) ||
    statusTokens.delivering.some((token) => normalizedStatus.includes(token)) ||
    statusTokens.delivered.some((token) => normalizedStatus.includes(token))
      ? order.updatedAt || order.createdAt
      : undefined;

  const deliveringAt =
    statusTokens.delivering.some((token) => normalizedStatus.includes(token)) ||
    statusTokens.delivered.some((token) => normalizedStatus.includes(token))
      ? order.updatedAt || order.createdAt
      : undefined;

  const deliveredAt = statusTokens.delivered.some((token) => normalizedStatus.includes(token))
    ? order.updatedAt || order.createdAt
    : undefined;

  const timeline = [
    { label: "Đơn hàng được tạo", time: placedAt, active: currentStep >= 1 },
    { label: "Đã xác nhận", time: processedAt, active: currentStep >= 2 },
    { label: "Đang giao", time: deliveringAt, active: currentStep >= 3 },
    { label: "Hoàn tất", time: deliveredAt, active: currentStep >= 4 },
  ];

  if (isCancelled) {
    timeline.push({
      label: "Đơn hàng đã hủy",
      time: order.updatedAt || order.createdAt,
      active: true,
      danger: true,
    });
  }

  return timeline;
};

export default function OrderDetailPage({ order }: OrderDetailPageProps) {
  const items = getItems(order);
  const initials = getNameInitials(order.arrivalName);
  const totalQuantity = getTotalQuantity(items);
  const subtotal =
    order.cart?.totalPrice ??
    items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const finalPrice = order.cart?.finalPrice ?? order.finalPrice ?? order.totalPrice ?? subtotal;
  const discount = Math.max((subtotal || 0) - (finalPrice || 0), 0);
  const timeline = buildTimeline(order);
  const paymentStatus = getPaymentStatus(order);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/order"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-20 bg-white px-4 py-2 text-sm font-medium text-neutral-2 transition hover:border-primary-1 hover:text-primary-1"
        >
          <FiArrowLeft size={16} />
          Quay lại danh sách
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-primary-4 bg-primary-6 px-4 py-2 text-sm font-semibold text-primary-1 transition hover:border-primary-3 hover:bg-primary-5"
        >
          <FiDownload size={15} />
          In hóa đơn
        </button>
      </div>

      <section className="rounded-3xl border border-neutral-20 bg-[linear-gradient(118deg,#fff_0%,#fff7f7_35%,#fdfefe_100%)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-4">Chi tiết đơn hàng</p>
            <h1 className="text-3xl font-semibold text-neutral-black">Đơn #{getShortOrderId(order._id)}</h1>
            <p className="text-sm text-neutral-4">Đặt lúc {formatDateTime(order.createdAt)}</p>
          </div>

          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Cập nhật gần nhất</p>
            <p className="mt-1 text-sm font-semibold text-neutral-1">{formatDateTime(order.updatedAt)}</p>
          </div>
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Số lượng sản phẩm</p>
            <p className="mt-1 text-sm font-semibold text-neutral-1">{totalQuantity} sản phẩm</p>
          </div>
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Tổng thanh toán</p>
            <p className="mt-1 text-sm font-semibold text-primary-1">{formatCurrency(finalPrice)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              <FiUser size={16} className="text-primary-1" />
              Thông tin khách hàng
            </h2>

            <div className="mt-4 rounded-2xl border border-neutral-20 bg-neutral-10 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-5 text-sm font-bold text-primary-1">
                  {initials}
                </div>

                <div>
                  <p className="text-base font-semibold text-neutral-1">{order.arrivalName || "Khách hàng"}</p>
                  <p className="text-xs text-neutral-4">Mã khách: {order.customerId || "--"}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-xl border border-neutral-20 bg-white px-3 py-2.5">
                  <p className="text-xs text-neutral-4">Số điện thoại</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-neutral-1">
                    <FiPhone size={14} className="text-neutral-4" />
                    {order.arrivalPhone || "--"}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-20 bg-white px-3 py-2.5">
                  <p className="text-xs text-neutral-4">Ghi chú đơn hàng</p>
                  <p className="mt-1 font-semibold text-neutral-1">{order.note || "Không có"}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              <FiPackage size={16} className="text-primary-1" />
              Chi tiết sản phẩm
            </h2>

            <div className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-20 bg-neutral-10 p-4 text-sm text-neutral-4">
                  Đơn hàng chưa có dữ liệu sản phẩm.
                </div>
              ) : (
                items.map((item, index) => {
                  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

                  return (
                    <div
                      key={item._id || item.productId || `${item.name || "item"}-${index}`}
                      className="rounded-2xl border border-neutral-20 bg-neutral-10 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name || "Sản phẩm"}
                              className="h-14 w-14 rounded-xl border border-neutral-20 bg-white object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-20 bg-white text-neutral-4">
                              <FiPackage size={18} />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-neutral-1">{item.name || "Sản phẩm"}</p>
                            <p className="mt-1 text-xs text-neutral-4">SKU: {item.productId || "--"}</p>
                          </div>
                        </div>

                        <p className="text-lg font-semibold text-primary-1">{formatCurrency(lineTotal)}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:max-w-sm">
                        <div className="rounded-lg bg-white px-3 py-2">
                          <p className="text-neutral-4">Số lượng</p>
                          <p className="font-semibold text-neutral-1">{Number(item.quantity) || 0}</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2">
                          <p className="text-neutral-4">Đơn giá</p>
                          <p className="font-semibold text-neutral-1">{formatCurrency(Number(item.price) || 0)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              <FiMapPin size={16} className="text-primary-1" />
              Địa chỉ giao hàng
            </h2>
            <div className="mt-4 rounded-2xl border border-neutral-20 bg-neutral-10 p-4 text-neutral-2">
              <p className="leading-relaxed">{order.arrivalAddress || "--"}</p>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              <FiClock size={16} className="text-primary-1" />
              Tiến trình đơn hàng
            </h2>

            <ol className="mt-4 space-y-4">
              {timeline.map((step, index) => (
                <li key={`${step.label}-${index}`} className="relative pl-8">
                  {index < timeline.length - 1 ? (
                    <span className="absolute left-2.25 top-6 h-[calc(100%-6px)] w-px bg-neutral-20" />
                  ) : null}

                  <span
                    className={`absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                      "danger" in step && step.danger
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : step.active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                        : "border-neutral-20 bg-white text-neutral-4"
                    }`}
                  >
                    {"danger" in step && step.danger ? <FiAlertCircle size={12} /> : <FiCheckCircle size={12} />}
                  </span>
                  <p className={`font-medium ${step.active ? "text-neutral-1" : "text-neutral-4"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-4">{formatDateTime(step.time)}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              <FiCreditCard size={16} className="text-primary-1" />
              Thông tin thanh toán
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Phương thức</dt>
                <dd className="font-medium text-neutral-1">{getPaymentMethodLabel(order.paymentMethod)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Trạng thái</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${paymentStatus.className}`}
                  >
                    {paymentStatus.label}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Mã giao dịch</dt>
                <dd className="font-medium text-neutral-1">{order.cartId || "--"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">Tổng kết đơn hàng</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Sản phẩm</dt>
                <dd className="font-medium text-neutral-1">{totalQuantity}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Tạm tính</dt>
                <dd className="font-medium text-neutral-1">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Giảm giá</dt>
                <dd className="font-medium text-emerald-600">-{formatCurrency(discount)}</dd>
              </div>
              <div className="h-px bg-neutral-20" />
              <div className="flex items-center justify-between gap-2 text-base">
                <dt className="font-semibold text-neutral-1">Tổng thanh toán</dt>
                <dd className="font-semibold text-primary-1">{formatCurrency(finalPrice)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
}
