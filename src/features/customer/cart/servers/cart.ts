"use server";

import { cookies } from "next/headers";
import { del, get, patch, post } from "@/integrations/storeClient";
import type { CartItem } from "@/store";

interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface OpenCartData {
  items: CartItem[];
}

interface SyncOpenCartInput {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
}

interface SyncOpenCartPricingInput {
  coupon?: string;
  couponCode?: string;
  totalPrice: number;
  totalDiscount?: number;
  finalPrice?: number;
}

interface CreateOrderFromOpenCartInput {
  customerId?: string;
  cartId?: string;
  arrivalName: string;
  arrivalPhone: string;
  arrivalAddress: string;
  status?: string;
  paymentMethod?: string;
  arrivalTime?: string;
  note?: string;
  coupon?: string;
  couponCode?: string;
}

export interface AvailableCoupon {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

interface AvailableCouponsData {
  items: AvailableCoupon[];
}

const normalizeCartItems = (rawItems: unknown): CartItem[] => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const items: CartItem[] = [];

  for (const rawItem of rawItems) {
    const item = rawItem as {
      _id?: string;
      productId?: string;
      name?: string;
      image?: string;
      slug?: string;
      price?: number;
      unitPrice?: number;
      quantity?: number;
      qty?: number;
      product?: {
        _id?: string;
        name?: string;
        image?: string;
        slug?: string;
        price?: number;
      };
    };

    const productId = item.productId || item._id || item.product?._id;
    if (!productId) {
      continue;
    }

    items.push({
      _id: productId,
      name: item.name || item.product?.name || "San pham",
      image: item.image || item.product?.image || "",
      slug: item.slug || item.product?.slug,
      price: Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? item.qty ?? 1)),
    });
  }

  return items;
};

const getRawOpenItems = (response: unknown): unknown => {
  const data = (response as { data?: unknown })?.data;

  if (Array.isArray(data)) {
    return data;
  }

  const asObject = (data || {}) as {
    items?: unknown;
    cartItems?: unknown;
    products?: unknown;
  };

  return asObject.items || asObject.cartItems || asObject.products || [];
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const isExplicitFailure = (response: unknown): boolean => {
  if (!response) {
    return true;
  }

  const success = (response as { success?: unknown })?.success;
  return typeof success === "boolean" ? !success : false;
};

const getResponseMessage = (response: unknown, fallback: string): string => {
  if (!response || typeof response !== "object") {
    return fallback;
  }

  const message = (response as { message?: unknown }).message;
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return undefined;
};

const normalizeCouponDiscountType = (value: unknown): "percent" | "fixed" | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["percent", "percentage", "pct", "%"].includes(normalizedValue)) {
    return "percent";
  }

  if (["fixed", "amount", "flat", "cash"].includes(normalizedValue)) {
    return "fixed";
  }

  return undefined;
};

const normalizeAvailableCoupon = (value: unknown): AvailableCoupon | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const coupon = value as Record<string, unknown>;
  const code = toStringValue(coupon.code || coupon.couponCode).trim();
  const discountType = normalizeCouponDiscountType(coupon.discountType || coupon.type);
  const discountValue = toNumberValue(coupon.discountValue ?? coupon.value ?? coupon.amount);

  if (!code || !discountType || typeof discountValue !== "number" || discountValue <= 0) {
    return null;
  }

  const description = toStringValue(coupon.description || coupon.note).trim();
  const startDate = toStringValue(coupon.startDate || coupon.startsAt || coupon.validFrom).trim();
  const endDate = toStringValue(coupon.endDate || coupon.endsAt || coupon.validUntil).trim();

  return {
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderValue: toNumberValue(coupon.minOrderValue ?? coupon.minOrderAmount),
    maxDiscount: toNumberValue(coupon.maxDiscount ?? coupon.maxDiscountValue ?? coupon.maxDiscountAmount),
    description: description || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    isActive: typeof coupon.isActive === "boolean" ? coupon.isActive : undefined,
  };
};

const normalizeAvailableCoupons = (value: unknown): AvailableCoupon[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeAvailableCoupon(item))
      .filter((item): item is AvailableCoupon => Boolean(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const payload = value as {
    items?: unknown;
    coupons?: unknown;
    data?: unknown;
  };

  if (Array.isArray(payload.items)) {
    return normalizeAvailableCoupons(payload.items);
  }

  if (Array.isArray(payload.coupons)) {
    return normalizeAvailableCoupons(payload.coupons);
  }

  if (payload.data) {
    return normalizeAvailableCoupons(payload.data);
  }

  const singleCoupon = normalizeAvailableCoupon(payload);
  return singleCoupon ? [singleCoupon] : [];
};

const isCouponWithinDateRange = (coupon: AvailableCoupon): boolean => {
  const now = Date.now();

  if (coupon.startDate) {
    const startAt = new Date(coupon.startDate).getTime();
    if (!Number.isNaN(startAt) && now < startAt) {
      return false;
    }
  }

  if (coupon.endDate) {
    const endAt = new Date(coupon.endDate).getTime();
    if (!Number.isNaN(endAt) && now > endAt) {
      return false;
    }
  }

  return true;
};

const getCartIdFromResponse = (response: unknown): string => {
  const data = (response as { data?: unknown })?.data;

  if (!data || Array.isArray(data) || typeof data !== "object") {
    return "";
  }

  const record = data as Record<string, unknown>;

  return (
    toStringValue(record.cartId) ||
    toStringValue(record.cartid) ||
    toStringValue(record._id) ||
    toStringValue(record.id)
  );
};

const getCurrentUserId = async (): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || "";
};

export const getAvailableCoupons = async (): Promise<ActionResult<AvailableCouponsData>> => {
  const response = await get("/coupons");

  if (isExplicitFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Failed to load available coupons"),
      data: { items: [] },
    };
  }

  const rawItems = (response as { data?: unknown })?.data;
  const responseSuccess = (response as { success?: unknown })?.success;
  const items = normalizeAvailableCoupons(rawItems).filter(
    (coupon) => (coupon.isActive ?? true) && isCouponWithinDateRange(coupon)
  );

  return {
    success: typeof responseSuccess === "boolean" ? responseSuccess : true,
    message:
      (response as { message?: string })?.message || "Available coupons loaded successfully",
    data: {
      items,
    },
  };
};

export const getOpenCart = async (): Promise<ActionResult<OpenCartData>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated", data: { items: [] } };
  }

  const response = await get(`/carts/${userId}`, { status: "open" });

  if (isExplicitFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Failed to load open cart"),
      data: { items: [] },
    };
  }

  const items = normalizeCartItems(getRawOpenItems(response));

  return {
    success: true,
    message: "Open cart loaded",
    data: { items },
  };
};

export const syncOpenCartItem = async (
  input: SyncOpenCartInput
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const payload = {
    productId: input.productId,
    quantity: Math.max(1, input.quantity),
    price: Number(input.price || 0),
    name: input.name,
    image: input.image,
    slug: input.slug,
  };

  const response = await patch(`/carts/${userId}/items`, payload);

  if (!response) {
    return { success: false, message: "Failed to sync open cart item" };
  }

  return { success: true, message: "Open cart item synced" };
};

export const updateOpenCartItem = async (
  productId: string,
  quantity: number
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const normalizedQuantity = Math.max(1, quantity);
  const response = await patch(`/carts/${userId}/items`, {
    productId,
    quantity: normalizedQuantity,
  });

  if (!response) {
    return { success: false, message: "Failed to update open cart item" };
  }

  return { success: true, message: "Open cart item updated" };
};

export const syncOpenCartPricing = async (
  input: SyncOpenCartPricingInput
): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const openCartResponse = await get(`/carts/${userId}`, { status: "open" });

  if (isExplicitFailure(openCartResponse)) {
    return {
      success: false,
      message: getResponseMessage(openCartResponse, "Failed to load open cart"),
    };
  }

  const cartId = getCartIdFromResponse(openCartResponse);
  const resolvedCouponCode =
    toStringValue(input.coupon).trim() || toStringValue(input.couponCode).trim();

  const totalPrice = Math.max(0, toNumberValue(input.totalPrice) ?? 0);
  const explicitFinalPrice = toNumberValue(input.finalPrice);
  const requestedDiscount = Math.max(0, toNumberValue(input.totalDiscount) ?? 0);
  const finalPrice = Math.max(
    0,
    typeof explicitFinalPrice === "number" ? explicitFinalPrice : totalPrice - requestedDiscount
  );
  const totalDiscount = Math.min(totalPrice, Math.max(0, totalPrice - finalPrice));

  const payload: {
    cartId?: string;
    coupon: string;
    couponCode: string;
    totalPrice: number;
    totalDiscount: number;
    finalPrice: number;
  } = {
    coupon: resolvedCouponCode,
    couponCode: resolvedCouponCode,
    totalPrice,
    totalDiscount,
    finalPrice,
  };

  if (cartId) {
    payload.cartId = cartId;
  }

  const response = await patch(`/carts/${userId}/open`, payload);

  if (isExplicitFailure(response)) {
    return {
      success: false,
      message: getResponseMessage(response, "Failed to sync open cart pricing"),
    };
  }

  return {
    success: true,
    message: getResponseMessage(response, "Open cart pricing synced"),
  };
};

export const removeOpenCartItem = async (productId: string): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const response = await del(`/carts/${userId}/items/${productId}`);

  if (!response) {
    return { success: false, message: "Failed to remove open cart item" };
  }

  return { success: true, message: "Open cart item removed" };
};

export const clearOpenCart = async (): Promise<ActionResult<null>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const response = await del(`/carts/${userId}/open`);

  if (!response) {
    return { success: false, message: "Failed to clear open cart" };
  }

  return { success: true, message: "Open cart cleared" };
};

export const createOrderFromOpenCart = async (
  input: CreateOrderFromOpenCartInput
): Promise<ActionResult<{ orderId?: string }>> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  const openCartResponse = await get(`/carts/${userId}`, { status: "open" });
  if (isExplicitFailure(openCartResponse)) {
    return {
      success: false,
      message: getResponseMessage(openCartResponse, "Failed to load open cart"),
    };
  }

  const detectedCartId = getCartIdFromResponse(openCartResponse);
  const resolvedCartId = input.cartId || detectedCartId;
  const resolvedCouponCode =
    toStringValue(input.coupon).trim() || toStringValue(input.couponCode).trim() || undefined;

  const payload = {
    customerId: input.customerId || userId,
    cartId: resolvedCartId,
    status: input.status || "paid_later",
    paymentMethod: input.paymentMethod,
    arrivalName: input.arrivalName,
    arrivalPhone: input.arrivalPhone,
    arrivalAddress: input.arrivalAddress,
    arrivalTime: input.arrivalTime,
    note: input.note,
    coupon: resolvedCouponCode,
    couponCode: resolvedCouponCode,
  };

  if (!payload.cartId) {
    return { success: false, message: "Không tìm thấy cartId để tạo đơn hàng" };
  }

  const orderResponse = await post(`/orders`, payload);

  if (isExplicitFailure(orderResponse)) {
    return {
      success: false,
      message: getResponseMessage(orderResponse, "Failed to create order from open cart"),
    };
  }

  let checkoutResponse = await patch(`/carts/${userId}/checkout`);

  if (isExplicitFailure(checkoutResponse)) {
    checkoutResponse = await patch(`/carts/${userId}/close`);
  }

  const checkoutStatus =
    toStringValue(
      (checkoutResponse as { data?: { status?: unknown } } | null)?.data?.status
    )
      .trim()
      .toLowerCase();

  if (!isExplicitFailure(checkoutResponse) && checkoutStatus && checkoutStatus !== "close") {
    checkoutResponse = await patch(`/carts/${userId}/close`);
  }

  if (isExplicitFailure(checkoutResponse)) {
    return {
      success: false,
      message: getResponseMessage(checkoutResponse, "Order created but failed to close cart"),
    };
  }

  const data = (orderResponse as { data?: { orderId?: string; id?: string; _id?: string } })?.data;

  return {
    success: true,
    message: getResponseMessage(orderResponse, "Open cart checked out successfully"),
    data: { orderId: data?.orderId || data?.id || data?._id },
  };
};

// Backward-compatible aliases while migrating callers from draft -> open.
export const getDraftCart = getOpenCart;
export const syncDraftCartItem = syncOpenCartItem;
export const updateDraftCartItem = updateOpenCartItem;
export const removeDraftCartItem = removeOpenCartItem;
export const clearDraftCart = clearOpenCart;
export const createOrderFromDraft = createOrderFromOpenCart;
