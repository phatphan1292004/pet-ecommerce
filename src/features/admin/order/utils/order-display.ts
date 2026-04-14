import type { AdminOrder, AdminOrderDetail, AdminOrderItem } from "@/features/admin/order/servers";

interface OrderStatusOptions {
  includeProcessing?: boolean;
}

export interface OrderTimelineStep {
  label: string;
  time?: string;
  active: boolean;
  danger?: boolean;
}

export interface PaymentStatusBadge {
  label: string;
  className: string;
}

const statusTokens = {
  pending: ["pending", "cho_xac_nhan", "dang_cho", "awaiting", "waiting"],
  processing: ["processing", "confirmed", "xac_nhan", "da_xac_nhan"],
  delivering: ["delivering", "shipping", "dang_giao", "in_transit"],
  delivered: ["delivered", "da_giao", "completed", "done", "hoan_thanh"],
  cancelled: ["cancelled", "canceled", "da_huy", "huy"],
} as const;

const hasAnyStatusToken = (normalizedStatus: string, tokens: readonly string[]) =>
  tokens.some((token) => normalizedStatus.includes(token));

export const normalizeOrderStatus = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, "_").replace(/đ/g, "d");

export const formatDateTime = (value?: string) => {
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

export const formatCurrency = (value?: number) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} VND` : "--";

export const getOrderStatusLabel = (status?: string, options: OrderStatusOptions = {}) => {
  const normalized = normalizeOrderStatus(status);
  const { includeProcessing = true } = options;

  if (hasAnyStatusToken(normalized, statusTokens.pending)) {
    return "Chờ xác nhận";
  }
  if (includeProcessing && hasAnyStatusToken(normalized, statusTokens.processing)) {
    return "Đã xác nhận";
  }
  if (hasAnyStatusToken(normalized, statusTokens.delivering)) {
    return "Đang giao";
  }
  if (hasAnyStatusToken(normalized, statusTokens.delivered)) {
    return "Hoàn thành";
  }
  if (hasAnyStatusToken(normalized, statusTokens.cancelled)) {
    return "Đã hủy";
  }

  return status || "--";
};

export const getOrderStatusStyles = (status?: string, options: OrderStatusOptions = {}) => {
  const normalized = normalizeOrderStatus(status);
  const { includeProcessing = true } = options;

  if (hasAnyStatusToken(normalized, statusTokens.pending)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (includeProcessing && hasAnyStatusToken(normalized, statusTokens.processing)) {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }
  if (hasAnyStatusToken(normalized, statusTokens.delivering)) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (hasAnyStatusToken(normalized, statusTokens.delivered)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (hasAnyStatusToken(normalized, statusTokens.cancelled)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-neutral-20 bg-neutral-10 text-neutral-4";
};

export const getOrderPaymentStatus = (order: Pick<AdminOrder, "status">): PaymentStatusBadge => {
  const normalizedStatus = normalizeOrderStatus(order.status);

  if (hasAnyStatusToken(normalizedStatus, statusTokens.delivered)) {
    return {
      label: "Đã thanh toán",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (hasAnyStatusToken(normalizedStatus, statusTokens.cancelled)) {
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

export const getPaymentMethodLabel = (method?: string) => {
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

export const getOrderItems = (
  order: Pick<AdminOrderDetail, "cart" | "products" | "items" | "cartItems">
): AdminOrderItem[] => order.cart?.products || order.products || order.items || order.cartItems || [];

export const getTotalQuantity = (items: AdminOrderItem[]) =>
  items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

export const getShortOrderId = (orderId?: string, emptyFallback = "------") => {
  if (!orderId) {
    return emptyFallback;
  }

  return orderId.length > 6 ? orderId.slice(-6).toUpperCase() : orderId.toUpperCase();
};

export const getNameInitials = (name?: string) => {
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

const getOrderStatusStep = (status?: string): number => {
  const normalized = normalizeOrderStatus(status);

  if (hasAnyStatusToken(normalized, statusTokens.delivered)) {
    return 4;
  }
  if (hasAnyStatusToken(normalized, statusTokens.delivering)) {
    return 3;
  }
  if (hasAnyStatusToken(normalized, statusTokens.processing)) {
    return 2;
  }

  return 1;
};

export const buildOrderTimeline = (
  order: Pick<AdminOrderDetail, "status" | "createdAt" | "updatedAt">
): OrderTimelineStep[] => {
  const normalizedStatus = normalizeOrderStatus(order.status);
  const currentStep = getOrderStatusStep(order.status);
  const isCancelled = hasAnyStatusToken(normalizedStatus, statusTokens.cancelled);

  const placedAt = order.createdAt;
  const processedAt =
    hasAnyStatusToken(normalizedStatus, statusTokens.processing) ||
    hasAnyStatusToken(normalizedStatus, statusTokens.delivering) ||
    hasAnyStatusToken(normalizedStatus, statusTokens.delivered)
      ? order.updatedAt || order.createdAt
      : undefined;

  const deliveringAt =
    hasAnyStatusToken(normalizedStatus, statusTokens.delivering) ||
    hasAnyStatusToken(normalizedStatus, statusTokens.delivered)
      ? order.updatedAt || order.createdAt
      : undefined;

  const deliveredAt = hasAnyStatusToken(normalizedStatus, statusTokens.delivered)
    ? order.updatedAt || order.createdAt
    : undefined;

  const timeline: OrderTimelineStep[] = [
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
