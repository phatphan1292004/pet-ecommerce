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
import type { AdminOrderDetail } from "@/features/admin/order/servers";
import {
  buildOrderTimeline,
  formatCurrency,
  formatDateTime,
  getNameInitials,
  getOrderItems,
  getOrderPaymentStatus,
  getOrderStatusLabel,
  getOrderStatusStyles,
  getPaymentMethodLabel,
  getShortOrderId,
  getTotalQuantity,
} from "@/features/admin/order/utils";
import Image from "next/image";

interface OrderDetailPageProps {
  order: AdminOrderDetail;
}

export default function OrderDetailPage({ order }: OrderDetailPageProps) {
  const items = getOrderItems(order);
  const customerInitials = getNameInitials(order.arrivalName);
  const customerPhotoURL = order.customerPhotoURL?.trim();
  const totalQuantity = getTotalQuantity(items);
  const subtotal =
    order.cart?.totalPrice ??
    items.reduce(
      (sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0,
    );
  const finalPrice =
    order.cart?.finalPrice ?? order.finalPrice ?? order.totalPrice ?? subtotal;
  const discount = Math.max((subtotal || 0) - (finalPrice || 0), 0);
  const timeline = buildOrderTimeline(order);
  const paymentStatus = getOrderPaymentStatus(order);

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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-4">
              Chi tiết đơn hàng
            </p>
            <h1 className="text-3xl font-semibold text-neutral-black">
              Đơn #{getShortOrderId(order._id)}
            </h1>
            <p className="text-sm text-neutral-4">
              Đặt lúc {formatDateTime(order.createdAt)}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusStyles(
              order.status,
            )}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Cập nhật gần nhất</p>
            <p className="mt-1 text-sm font-semibold text-neutral-1">
              {formatDateTime(order.updatedAt)}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Số lượng sản phẩm</p>
            <p className="mt-1 text-sm font-semibold text-neutral-1">
              {totalQuantity} sản phẩm
            </p>
          </div>
          <div className="rounded-xl border border-neutral-20 bg-white/80 p-3">
            <p className="text-xs text-neutral-4">Tổng thanh toán</p>
            <p className="mt-1 text-sm font-semibold text-primary-1">
              {formatCurrency(finalPrice)}
            </p>
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
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-5 text-sm font-bold text-primary-1">
                  {customerPhotoURL ? (
                    <Image
                      src={customerPhotoURL}
                      alt={order.arrivalName || "Customer Photo"}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{customerInitials}</span>
                  )}
                </div>

                <div>
                  <p className="text-base font-semibold text-neutral-1">
                    {order.arrivalName || "Khách hàng"}
                  </p>
                  <p className="text-xs text-neutral-4">
                    Mã khách: {order.customerId || "--"}
                  </p>
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
                  <p className="mt-1 font-semibold text-neutral-1">
                    {order.note || "Không có"}
                  </p>
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
                  const lineTotal =
                    (Number(item.price) || 0) * (Number(item.quantity) || 0);

                  return (
                    <div
                      key={
                        item._id ||
                        item.productId ||
                        `${item.name || "item"}-${index}`
                      }
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
                            <p className="font-semibold text-neutral-1">
                              {item.name || "Sản phẩm"}
                            </p>
                            <p className="mt-1 text-xs text-neutral-4">
                              SKU: {item.productId || "--"}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg font-semibold text-primary-1">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:max-w-sm">
                        <div className="rounded-lg bg-white px-3 py-2">
                          <p className="text-neutral-4">Số lượng</p>
                          <p className="font-semibold text-neutral-1">
                            {Number(item.quantity) || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2">
                          <p className="text-neutral-4">Đơn giá</p>
                          <p className="font-semibold text-neutral-1">
                            {formatCurrency(Number(item.price) || 0)}
                          </p>
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
                      step.danger
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : step.active
                          ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                          : "border-neutral-20 bg-white text-neutral-4"
                    }`}
                  >
                    {step.danger ? (
                      <FiAlertCircle size={12} />
                    ) : (
                      <FiCheckCircle size={12} />
                    )}
                  </span>
                  <p
                    className={`font-medium ${step.active ? "text-neutral-1" : "text-neutral-4"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-4">
                    {formatDateTime(step.time)}
                  </p>
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
                <dd className="font-medium text-neutral-1">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </dd>
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
                <dd className="font-medium text-neutral-1">
                  {order.cartId || "--"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-neutral-20 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-2">
              Tổng kết đơn hàng
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Sản phẩm</dt>
                <dd className="font-medium text-neutral-1">{totalQuantity}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Tạm tính</dt>
                <dd className="font-medium text-neutral-1">
                  {formatCurrency(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-4">Giảm giá</dt>
                <dd className="font-medium text-emerald-600">
                  -{formatCurrency(discount)}
                </dd>
              </div>
              <div className="h-px bg-neutral-20" />
              <div className="flex items-center justify-between gap-2 text-base">
                <dt className="font-semibold text-neutral-1">
                  Tổng thanh toán
                </dt>
                <dd className="font-semibold text-primary-1">
                  {formatCurrency(finalPrice)}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
}
